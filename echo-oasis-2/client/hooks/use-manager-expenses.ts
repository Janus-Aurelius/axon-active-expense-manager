import { useState, useEffect, useCallback } from "react";
import { managerExpenseApiService } from "@/lib/api/manager-expense-api";
import { expenseApiService } from "@/lib/api/employee-expense-api";
import type {
  ExpenseResponse,
  ExpenseStatus,
} from "@/lib/api/employee-expense-api";

export interface UseManagerExpensesReturn {
  // Data
  pendingExpenses: ExpenseResponse[];
  approvedExpenses: ExpenseResponse[];
  allExpenses: ExpenseResponse[];

  // Loading states
  loading: boolean;
  loadingApprove: boolean;
  loadingReject: boolean;

  // Error states
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  approveExpense: (expenseId: number, comment?: string) => Promise<void>;
  rejectExpense: (expenseId: number, comment: string) => Promise<void>;
  batchApproveExpenses: (
    expenseIds: number[],
    comment?: string,
  ) => Promise<void>;
  batchRejectExpenses: (expenseIds: number[], comment: string) => Promise<void>;

  // Statistics
  stats: {
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
  };
}

export function useManagerExpenses(): UseManagerExpensesReturn {
  const [pendingExpenses, setPendingExpenses] = useState<ExpenseResponse[]>([]);
  const [approvedExpenses, setApprovedExpenses] = useState<ExpenseResponse[]>(
    [],
  );
  const [allExpenses, setAllExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel for better performance
      const [pending, approved, all] = await Promise.all([
        managerExpenseApiService.getPendingExpensesForApproval(),
        managerExpenseApiService.getExpensesApprovedByManager(),
        managerExpenseApiService.getExpensesProcessedByManager(),
      ]);

      setPendingExpenses(pending);
      setApprovedExpenses(approved);
      setAllExpenses(all);
    } catch (err) {
      console.error("Error fetching manager expenses:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  const approveExpense = useCallback(
    async (expenseId: number, comment?: string) => {
      try {
        setLoadingApprove(true);
        setError(null);

        await managerExpenseApiService.approveExpense(expenseId, { comment });

        // Refresh data after successful approval
        await refreshData();
      } catch (err) {
        console.error("Error approving expense:", err);
        setError(
          err instanceof Error ? err.message : "Failed to approve expense",
        );
        throw err; // Re-throw so UI can handle it
      } finally {
        setLoadingApprove(false);
      }
    },
    [refreshData],
  );

  const rejectExpense = useCallback(
    async (expenseId: number, comment: string) => {
      try {
        setLoadingReject(true);
        setError(null);

        await managerExpenseApiService.rejectExpense(expenseId, { comment });

        // Refresh data after successful rejection
        await refreshData();
      } catch (err) {
        console.error("Error rejecting expense:", err);
        setError(
          err instanceof Error ? err.message : "Failed to reject expense",
        );
        throw err; // Re-throw so UI can handle it
      } finally {
        setLoadingReject(false);
      }
    },
    [refreshData],
  );

  const batchApproveExpenses = useCallback(
    async (expenseIds: number[], comment?: string) => {
      try {
        setLoadingApprove(true);
        setError(null);

        await managerExpenseApiService.batchApproveExpenses(
          expenseIds,
          comment,
        );

        // Refresh data after successful batch approval
        await refreshData();
      } catch (err) {
        console.error("Error batch approving expenses:", err);
        setError(
          err instanceof Error ? err.message : "Failed to approve expenses",
        );
        throw err; // Re-throw so UI can handle it
      } finally {
        setLoadingApprove(false);
      }
    },
    [refreshData],
  );

  const batchRejectExpenses = useCallback(
    async (expenseIds: number[], comment: string) => {
      try {
        setLoadingReject(true);
        setError(null);

        await managerExpenseApiService.batchRejectExpenses(expenseIds, comment);

        // Refresh data after successful batch rejection
        await refreshData();
      } catch (err) {
        console.error("Error batch rejecting expenses:", err);
        setError(
          err instanceof Error ? err.message : "Failed to reject expenses",
        );
        throw err; // Re-throw so UI can handle it
      } finally {
        setLoadingReject(false);
      }
    },
    [refreshData],
  );

  // Calculate statistics
  const stats = {
    totalAmount: allExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    pendingAmount: pendingExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    ),
    approvedAmount: approvedExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    ),
    totalCount: allExpenses.length,
    pendingCount: pendingExpenses.length,
    approvedCount: approvedExpenses.length,
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    pendingExpenses,
    approvedExpenses,
    allExpenses,
    loading,
    loadingApprove,
    loadingReject,
    error,
    refreshData,
    approveExpense,
    rejectExpense,
    batchApproveExpenses,
    batchRejectExpenses,
    stats,
  };
}
