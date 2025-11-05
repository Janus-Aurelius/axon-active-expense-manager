import { useState, useEffect, useCallback } from "react";
import {
  financeExpenseApiService,
  type FinanceActionRequest,
  type FinanceRejectionRequest,
  type FinanceStatsResponse,
} from "@/lib/api/finance-expense-api";
import type { ExpenseResponse } from "@/lib/api/employee-expense-api";

export function useFinanceExpenses() {
  const [pendingExpenses, setPendingExpenses] = useState<ExpenseResponse[]>([]);
  const [paidExpenses, setPaidExpenses] = useState<ExpenseResponse[]>([]);
  const [historyExpenses, setHistoryExpenses] = useState<ExpenseResponse[]>([]);
  const [stats, setStats] = useState<FinanceStatsResponse>({
    totalExpenses: 0,
    totalAmount: 0,
    toPay: 0,
    toPayAmount: 0,
    paid: 0,
    paidAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pending expenses for finance approval
  const loadPendingExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const expenses =
        await financeExpenseApiService.getPendingExpensesForApproval();
      setPendingExpenses(expenses);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pending expenses",
      );
      console.error("Error loading pending expenses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load approved expenses (paid expenses)
  const loadPaidExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const expenses =
        await financeExpenseApiService.getExpensesApprovedByFinance();
      setPaidExpenses(expenses);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load paid expenses",
      );
      console.error("Error loading paid expenses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load history expenses
  const loadHistoryExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const expenses =
        await financeExpenseApiService.getExpensesProcessedByFinance();
      setHistoryExpenses(expenses);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load expense history",
      );
      console.error("Error loading expense history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load finance statistics
  const loadStats = useCallback(async () => {
    try {
      const financeStats = await financeExpenseApiService.getFinanceStats();
      setStats(financeStats);
    } catch (err) {
      console.error("Error loading finance stats:", err);
    }
  }, []);

  // Approve a single expense
  const approveExpense = useCallback(
    async (expenseId: number, actionRequest: FinanceActionRequest = {}) => {
      try {
        setLoading(true);
        setError(null);

        const updatedExpense = await financeExpenseApiService.approveExpense(
          expenseId,
          actionRequest,
        );

        // Update local state
        setPendingExpenses((prev) =>
          prev.filter((expense) => expense.id !== expenseId),
        );
        setPaidExpenses((prev) => [...prev, updatedExpense]);

        // Refresh stats
        await loadStats();

        return updatedExpense;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to approve expense";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadStats],
  );

  // Reject a single expense
  const rejectExpense = useCallback(
    async (expenseId: number, rejectionRequest: FinanceRejectionRequest) => {
      try {
        setLoading(true);
        setError(null);

        const updatedExpense = await financeExpenseApiService.rejectExpense(
          expenseId,
          rejectionRequest,
        );

        // Remove from pending expenses (rejected expenses go back to employee)
        setPendingExpenses((prev) =>
          prev.filter((expense) => expense.id !== expenseId),
        );

        // Refresh stats
        await loadStats();

        return updatedExpense;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reject expense";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadStats],
  );

  // Batch approve multiple expenses
  const batchApproveExpenses = useCallback(
    async (expenseIds: number[], actionRequest: FinanceActionRequest = {}) => {
      try {
        setLoading(true);
        setError(null);

        const approvedExpenses =
          await financeExpenseApiService.batchApproveExpenses(
            expenseIds,
            actionRequest,
          );

        // Update local state
        const approvedIds = approvedExpenses.map((expense) => expense.id);
        setPendingExpenses((prev) =>
          prev.filter((expense) => !approvedIds.includes(expense.id)),
        );
        setPaidExpenses((prev) => [...prev, ...approvedExpenses]);

        // Refresh stats
        await loadStats();

        return approvedExpenses;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to approve expenses";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadStats],
  );

  // Batch reject multiple expenses
  const batchRejectExpenses = useCallback(
    async (expenseIds: number[], comment: string) => {
      try {
        setLoading(true);
        setError(null);

        const rejectedExpenses =
          await financeExpenseApiService.batchRejectExpenses(
            expenseIds,
            comment,
          );

        // Remove from pending expenses
        const rejectedIds = rejectedExpenses.map((expense) => expense.id);
        setPendingExpenses((prev) =>
          prev.filter((expense) => !rejectedIds.includes(expense.id)),
        );

        // Refresh stats
        await loadStats();

        return rejectedExpenses;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reject expenses";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadStats],
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadPendingExpenses(),
      loadPaidExpenses(),
      loadHistoryExpenses(),
      loadStats(),
    ]);
  }, [loadPendingExpenses, loadPaidExpenses, loadHistoryExpenses, loadStats]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Data
    pendingExpenses,
    paidExpenses,
    historyExpenses,
    stats,

    // State
    loading,
    error,

    // Actions
    approveExpense,
    rejectExpense,
    batchApproveExpenses,
    batchRejectExpenses,
    refreshData,

    // Data loading functions
    loadPendingExpenses,
    loadPaidExpenses,
    loadHistoryExpenses,
    loadStats,
  };
}
