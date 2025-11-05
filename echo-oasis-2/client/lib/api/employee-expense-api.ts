// Expense API types and service

export enum ExpenseStatus {
  PENDING_MANAGER = "PENDING_MANAGER",
  REJECTED_MANAGER = "REJECTED_MANAGER",
  APPROVED_MANAGER = "APPROVED_MANAGER",
  PENDING_FINANCE = "PENDING_FINANCE",
  REJECTED_FINANCE = "REJECTED_FINANCE",
  PAID = "PAID",
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number; // Will be converted to BigDecimal on backend
  receiptUrl?: string;
}

export interface ExpenseResponse {
  id: number;
  title: string;
  description: string;
  amount: number;
  receiptUrl?: string;
  status: ExpenseStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  employeeName: string;
  employeeEmail: string;
}

export interface MessageResponse {
  message: string;
}

class ExpenseApiService {
  private baseUrl = "http://localhost:8080/api/expenses";

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add dev role header (for development mode)
    const devRole = localStorage.getItem("dev-role");
    if (devRole) {
      headers["X-Dev-User-Role"] = devRole;
    }

    // Add auth token if available
    const token = localStorage.getItem("auth-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(
        error.message || `Request failed with status ${response.status}`,
      );
    }
    return response.json();
  }

  // ============= EMPLOYEE OPERATIONS =============

  /**
   * Create a new expense request
   */
  async createExpense(expense: CreateExpenseRequest): Promise<ExpenseResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(expense),
    });

    return this.handleResponse<ExpenseResponse>(response);
  }

  /**
   * Get all expenses for the current user
   */
  async getMyExpenses(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/my-expenses`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Get pending expenses for the current user
   */
  async getMyPendingExpenses(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/my-pending`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Get rejected expenses for the current user
   */
  async getMyRejectedExpenses(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/my-rejected`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: number): Promise<ExpenseResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse>(response);
  }

  /**
   * Update a pending expense
   */
  async updateExpense(
    id: number,
    expense: CreateExpenseRequest,
  ): Promise<ExpenseResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: await this.getHeaders(),
      body: JSON.stringify(expense),
    });

    return this.handleResponse<ExpenseResponse>(response);
  }

  /**
   * Delete a pending expense
   */
  async deleteExpense(id: number): Promise<MessageResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<MessageResponse>(response);
  }

  // ============= UTILITY METHODS =============

  /**
   * Get status display label
   */
  getStatusLabel(status: ExpenseStatus): string {
    switch (status) {
      case ExpenseStatus.PENDING_MANAGER:
        return "Pending Manager Review";
      case ExpenseStatus.REJECTED_MANAGER:
        return "Rejected by Manager";
      case ExpenseStatus.APPROVED_MANAGER:
        return "Approved by Manager";
      case ExpenseStatus.PENDING_FINANCE:
        return "Pending Finance Review";
      case ExpenseStatus.REJECTED_FINANCE:
        return "Rejected by Finance";
      case ExpenseStatus.PAID:
        return "Paid";
      default:
        return status;
    }
  }

  /**
   * Get status CSS class
   */
  getStatusClassName(status: ExpenseStatus): string {
    switch (status) {
      case ExpenseStatus.PENDING_MANAGER:
      case ExpenseStatus.PENDING_FINANCE:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case ExpenseStatus.REJECTED_MANAGER:
      case ExpenseStatus.REJECTED_FINANCE:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case ExpenseStatus.APPROVED_MANAGER:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case ExpenseStatus.PAID:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }

  /**
   * Check if expense can be edited
   */
  canEditExpense(status: ExpenseStatus): boolean {
    return [
      ExpenseStatus.PENDING_MANAGER,
      ExpenseStatus.REJECTED_MANAGER,
      ExpenseStatus.REJECTED_FINANCE,
    ].includes(status);
  }

  /**
   * Check if expense can be deleted
   */
  canDeleteExpense(status: ExpenseStatus): boolean {
    return [
      ExpenseStatus.PENDING_MANAGER,
      ExpenseStatus.REJECTED_MANAGER,
      ExpenseStatus.REJECTED_FINANCE,
    ].includes(status);
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

export const expenseApiService = new ExpenseApiService();
