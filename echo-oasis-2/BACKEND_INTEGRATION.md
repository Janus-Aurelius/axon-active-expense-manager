# ExpenseFlow Backend Integration Guide

This guide explains how to integrate ExpenseFlow with a backend server for authentication and data management.

## Overview

The ExpenseFlow frontend is ready to connect to a backend for:
- User authentication (login/signup)
- Expense data management
- Budget tracking
- User profile management

## Current Frontend Setup

The app has the following pages ready:
- **Home** (`/`) - Landing page
- **Login** (`/login`) - Sign in form
- **Signup** (`/signup`) - Registration form
- **Dashboard** (`/dashboard`) - User dashboard (placeholder)

## Backend Integration Steps

### 1. Authentication

#### Signup Endpoint

**Request:**
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

**Frontend Implementation** (`client/pages/Signup.tsx`):
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

#### Login Endpoint

**Request:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

**Frontend Implementation** (`client/pages/Login.tsx`):
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### 2. Protected Routes

Create a protected route wrapper for pages that require authentication:

**File:** `client/components/ProtectedRoute.tsx`

```typescript
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

**Update** `client/App.tsx`:
```typescript
import { ProtectedRoute } from './components/ProtectedRoute';

<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 3. API Utility

Create a reusable API utility with authentication headers:

**File:** `client/lib/api.ts`

```typescript
export async function apiCall(
  url: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle token refresh if needed
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        
        const refreshData = await refreshResponse.json();
        localStorage.setItem('authToken', refreshData.token);
        
        // Retry original request
        headers['Authorization'] = `Bearer ${refreshData.token}`;
        return fetch(url, { ...options, headers });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
  }
  
  return response;
}
```

### 4. Expense Management Endpoints

#### Get Expenses

```
GET /api/expenses
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "expenses": [
    {
      "id": "exp_1",
      "title": "Grocery Shopping",
      "amount": 45.50,
      "category": "Food",
      "date": "2024-01-15",
      "description": "Weekly groceries"
    }
  ],
  "total": 45.50
}
```

**Frontend Usage:**
```typescript
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';

export function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  
  useEffect(() => {
    const fetchExpenses = async () => {
      const response = await apiCall('/api/expenses');
      const data = await response.json();
      setExpenses(data.expenses);
    };
    
    fetchExpenses();
  }, []);
  
  return (
    <ul>
      {expenses.map(expense => (
        <li key={expense.id}>{expense.title}: ${expense.amount}</li>
      ))}
    </ul>
  );
}
```

#### Create Expense

```
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 45.50,
  "category": "Food",
  "date": "2024-01-15",
  "description": "Weekly groceries"
}
```

**Response:**
```json
{
  "success": true,
  "expense": {
    "id": "exp_1",
    "title": "Grocery Shopping",
    "amount": 45.50,
    "category": "Food",
    "date": "2024-01-15"
  }
}
```

#### Update Expense

```
PUT /api/expenses/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "amount": 50.00
}
```

#### Delete Expense

```
DELETE /api/expenses/{id}
Authorization: Bearer {token}
```

### 5. Backend Technology Options

#### Option A: Express.js (Node.js)

The starter already includes an Express server. You can add authentication:

**File:** `server/routes/auth.ts`

```typescript
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handleSignup: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  
  // TODO: Hash password with bcrypt
  // TODO: Save user to database
  // TODO: Generate JWT token
  
  const token = jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: '24h',
  });
  
  res.json({
    success: true,
    user: { id: userId, name, email },
    token,
    refreshToken: 'refresh_token_value',
  });
};

export const handleLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  
  // TODO: Find user by email
  // TODO: Compare password with bcrypt
  // TODO: Generate JWT token
  
  const token = jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: '24h',
  });
  
  res.json({
    success: true,
    user: { id: userId, name, email },
    token,
    refreshToken: 'refresh_token_value',
  });
};
```

**Register routes in** `server/index.ts`:

```typescript
import { handleSignup, handleLogin } from './routes/auth';

app.post('/api/auth/signup', handleSignup);
app.post('/api/auth/login', handleLogin);
```

#### Option B: Other Backend Solutions

You can use any backend that provides REST endpoints:

- **Firebase**: Use Firebase Authentication + Firestore
- **Supabase**: PostgreSQL database with built-in authentication
- **MongoDB + Node.js**: With Express for API endpoints
- **Python + Flask/Django**: For backend APIs
- **Go + Gin**: For high-performance APIs

### 6. Environment Variables

Add these to `.env.local` or use DevServerControl to set them:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
```

Update your API utility to use the base URL:

```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

export async function apiCall(url: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${url}`, {
    // ... rest of the code
  });
}
```

### 7. Error Handling

Implement proper error handling in your frontend:

```typescript
export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export async function apiCall(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## Next Steps

1. **Set up your backend** with authentication endpoints
2. **Implement token storage** (localStorage or secure cookies)
3. **Create protected routes** for authenticated pages
4. **Add API calls** to the login/signup forms
5. **Build the dashboard** with real expense data
6. **Add error handling** and user feedback

## Security Considerations

- **Never store sensitive data** in localStorage for production; use secure, httpOnly cookies instead
- **Validate all inputs** on both frontend and backend
- **Use HTTPS** in production
- **Implement CSRF protection** for POST requests
- **Use strong JWT secrets** and appropriate expiration times
- **Hash passwords** with bcrypt or similar
- **Rate limit** authentication endpoints
- **Add CORS headers** appropriately to your backend

## Support

For questions about integrating a specific backend service, refer to their documentation or create additional backend endpoints following the patterns shown above.
