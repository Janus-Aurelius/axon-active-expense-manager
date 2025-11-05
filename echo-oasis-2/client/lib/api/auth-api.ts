// API configuration and types for the expense manager

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface MessageResponse {
  message: string;
}

export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  FINANCE = "FINANCE",
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

class ApiService {
  private baseUrl = "http://localhost:8080/api"; // Backend URL

  // Store current user role for dev mode
  private currentRole: UserRole | null = null;

  setDevRole(role: UserRole) {
    this.currentRole = role;
    // Store in localStorage for persistence
    localStorage.setItem("dev-role", role);
  }

  getDevRole(): UserRole | null {
    if (this.currentRole) return this.currentRole;

    // Try to get from localStorage
    const stored = localStorage.getItem("dev-role");
    if (stored && Object.values(UserRole).includes(stored as UserRole)) {
      this.currentRole = stored as UserRole;
      return this.currentRole;
    }

    return null;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add dev role header if available
    const devRole = this.getDevRole();
    if (devRole) {
      headers["X-Dev-User-Role"] = devRole;
    }

    // Add auth token if available and requested
    if (includeAuth) {
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(false), // Don't include auth for login
      body: JSON.stringify(loginRequest),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Login failed" }));
      throw new Error(error.message || "Login failed");
    }

    const loginResponse: LoginResponse = await response.json();

    // Store token and user info
    if (loginResponse.token) {
      localStorage.setItem("auth-token", loginResponse.token);
    }
    localStorage.setItem(
      "user-info",
      JSON.stringify({
        userId: loginResponse.userId,
        fullName: loginResponse.fullName,
        email: loginResponse.email,
        role: loginResponse.role,
      }),
    );

    return loginResponse;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(),
      });
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-info");
      localStorage.removeItem("dev-role");
      this.currentRole = null;
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    const userData = await response.json();

    // Update local storage with latest user info
    localStorage.setItem(
      "user-info",
      JSON.stringify({
        userId: userData.userId,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
      }),
    );

    return userData;
  }

  // Get user info from localStorage (for quick access without API call)
  getStoredUserInfo(): User | null {
    try {
      const stored = localStorage.getItem("user-info");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth-token");
  }
}

export const apiService = new ApiService();
