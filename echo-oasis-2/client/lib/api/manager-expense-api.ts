// Manager Expense API types and service
import type {
  ExpenseResponse,
  MessageResponse,
  ExpenseStatus,
} from "./employee-expense-api";

export interface ManagerActionRequest {
  comment?: string;
}

export interface FinanceActionRequest {
  note?: string;
  reimbursementMethod?: string;
  expectedPayoutDate?: string; // ISO date string
}

export interface FinanceRejectionRequest {
  comment: string; // Required for rejection
}

class ManagerExpenseApiService {
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

  // ============= MANAGER OPERATIONS =============

  /**
   * Get all pending expenses awaiting manager approval
   */
  async getPendingExpensesForApproval(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/pending-manager-approval`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Get all expenses approved by manager (for approved tab)
   * Includes expenses with PENDING_FINANCE and PAID statuses
   */
  async getExpensesApprovedByManager(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/approved-by-manager`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Get all expenses processed by manager (for history tab)
   * Includes approved, rejected, and paid expenses
   */
  async getExpensesProcessedByManager(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/manager-history`, {
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
   * Approve a pending expense (Manager action)
   * Changes status from PENDING_MANAGER to PENDING_FINANCE
   */
  async approveExpense(
    expenseId: number,
    actionRequest: ManagerActionRequest = {},
  ): Promise<ExpenseResponse> {
    const response = await fetch(`${this.baseUrl}/${expenseId}/approve`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(actionRequest),
    });

    return this.handleResponse<ExpenseResponse>(response);
  }

  /**
   * Reject a pending expense (Manager action)
   * Changes status from PENDING_MANAGER to REJECTED_MANAGER
   */
  async rejectExpense(
    expenseId: number,
    actionRequest: ManagerActionRequest,
  ): Promise<ExpenseResponse> {
    const response = await fetch(`${this.baseUrl}/${expenseId}/reject`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(actionRequest),
    });

    return this.handleResponse<ExpenseResponse>(response);
  }

  /**
   * Batch approve multiple expenses
   */
  async batchApproveExpenses(
    expenseIds: number[],
    comment?: string,
  ): Promise<ExpenseResponse[]> {
    const results = await Promise.allSettled(
      expenseIds.map((id) => this.approveExpense(id, { comment })),
    );

    const successful = results
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) => (result as PromiseFulfilledResult<ExpenseResponse>).value,
      );

    const failed = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    if (failed.length > 0) {
      console.warn("Some expenses failed to approve:", failed);
    }

    return successful;
  }

  /**
   * Batch reject multiple expenses
   */
  async batchRejectExpenses(
    expenseIds: number[],
    comment: string,
  ): Promise<ExpenseResponse[]> {
    const results = await Promise.allSettled(
      expenseIds.map((id) => this.rejectExpense(id, { comment })),
    );

    const successful = results
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) => (result as PromiseFulfilledResult<ExpenseResponse>).value,
      );

    const failed = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    if (failed.length > 0) {
      console.warn("Some expenses failed to reject:", failed);
    }

    return successful;
  }
}

export const managerExpenseApiService = new ManagerExpenseApiService();
