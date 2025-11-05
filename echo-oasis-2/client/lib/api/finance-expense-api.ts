// Finance Expense API types and service
import {
  ExpenseStatus,
  type ExpenseResponse,
  type MessageResponse,
} from "./employee-expense-api";

export interface FinanceActionRequest {
  note?: string;
  reimbursementMethod?: string;
  expectedPayoutDate?: string; // ISO date string
}

export interface FinanceRejectionRequest {
  comment: string; // Required for rejection
}

export interface FinanceStatsResponse {
  totalExpenses: number;
  totalAmount: number;
  toPay: number;
  toPayAmount: number;
  paid: number;
  paidAmount: number;
}

class FinanceExpenseApiService {
  private baseUrl = "http://localhost:8080/api/expenses";

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add dev role header for finance (for development mode)
    headers["X-Dev-User-Role"] = "FINANCE";

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

  // ============= FINANCE OPERATIONS =============

  /**
   * Get all pending expenses awaiting finance approval
   */
  async getPendingExpensesForApproval(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/pending-finance-approval`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Get all expenses approved by finance (for approved tab)
   * Includes expenses with PAID status
   */
  async getExpensesApprovedByFinance(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/approved-by-finance`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Get all expenses processed by finance (for history tab)
   * Includes approved and rejected expenses
   */
  async getExpensesProcessedByFinance(): Promise<ExpenseResponse[]> {
    const response = await fetch(`${this.baseUrl}/finance-history`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    return this.handleResponse<ExpenseResponse[]>(response);
  }

  /**
   * Approve a pending expense with payout details (Finance action)
   * Changes status from PENDING_FINANCE to PAID
   */
  async approveExpense(
    expenseId: number,
    actionRequest: FinanceActionRequest = {},
  ): Promise<ExpenseResponse> {
    const response = await fetch(
      `${this.baseUrl}/${expenseId}/finance-approve`,
      {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify(actionRequest),
      },
    );

    return this.handleResponse<ExpenseResponse>(response);
  }

  /**
   * Reject a pending expense (Finance action)
   * Changes status from PENDING_FINANCE to REJECTED_FINANCE
   */
  async rejectExpense(
    expenseId: number,
    rejectionRequest: FinanceRejectionRequest,
  ): Promise<ExpenseResponse> {
    const response = await fetch(
      `${this.baseUrl}/${expenseId}/finance-reject`,
      {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify(rejectionRequest),
      },
    );

    return this.handleResponse<ExpenseResponse>(response);
  }

  /**
   * Batch approve multiple expenses
   */
  async batchApproveExpenses(
    expenseIds: number[],
    actionRequest: FinanceActionRequest = {},
  ): Promise<ExpenseResponse[]> {
    const results = await Promise.allSettled(
      expenseIds.map((id) => this.approveExpense(id, actionRequest)),
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

  /**
   * Get finance dashboard statistics
   */
  async getFinanceStats(): Promise<FinanceStatsResponse> {
    try {
      // Get all expenses that went through the finance process
      const [pendingExpenses, approvedExpenses] = await Promise.all([
        this.getPendingExpensesForApproval(),
        this.getExpensesApprovedByFinance(),
      ]);

      const allExpenses = [...pendingExpenses, ...approvedExpenses];

      const totalExpenses = allExpenses.length;
      const totalAmount = allExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      const toPay = pendingExpenses.length;
      const toPayAmount = pendingExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      const paid = approvedExpenses.length;
      const paidAmount = approvedExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      return {
        totalExpenses,
        totalAmount,
        toPay,
        toPayAmount,
        paid,
        paidAmount,
      };
    } catch (error) {
      console.error("Error fetching finance stats:", error);
      return {
        totalExpenses: 0,
        totalAmount: 0,
        toPay: 0,
        toPayAmount: 0,
        paid: 0,
        paidAmount: 0,
      };
    }
  }

  // ============= UTILITY METHODS =============

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

  /**
   * Get expense reference/ID display format
   */
  getExpenseReference(expense: ExpenseResponse): string {
    return `EXP-${expense.id.toString().padStart(3, "0")}`;
  }
}

export const financeExpenseApiService = new FinanceExpenseApiService();
