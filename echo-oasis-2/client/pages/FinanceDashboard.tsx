import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ExpenseTable, {
  ExpenseData,
  ColumnDefinition,
} from "@/components/ExpenseTable";
import FinanceActionDialog from "@/components/FinanceActionDialog";
import BatchFinanceActionDialog from "@/components/BatchFinanceActionDialog";
import ViewExpenseModal from "@/components/ViewExpenseModal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useFinanceExpenses } from "@/hooks/use-finance-expenses";
import {
  Home,
  DollarSign,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { financeExpenseApiService } from "@/lib/api/finance-expense-api";
import { expenseApiService } from "@/lib/api/employee-expense-api";
import type { ExpenseResponse } from "@/lib/api/employee-expense-api";
import type {
  FinanceActionRequest,
  FinanceRejectionRequest,
} from "@/lib/api/finance-expense-api";

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Finance expenses hook
  const {
    pendingExpenses,
    paidExpenses,
    historyExpenses,
    stats,
    loading,
    error,
    approveExpense,
    rejectExpense,
    batchApproveExpenses,
    batchRejectExpenses,
    refreshData,
  } = useFinanceExpenses();

  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    expense: ExpenseResponse | null;
    actionType: "approve" | "reject" | null;
  }>({
    expense: null,
    actionType: null,
  });

  const [batchActionDialog, setBatchActionDialog] = useState<{
    expenses: ExpenseResponse[];
    actionType: "approve" | "reject" | null;
  }>({
    expenses: [],
    actionType: null,
  });

  // View modal state
  const [viewModal, setViewModal] = useState<{
    open: boolean;
    expense: ExpenseResponse | null;
    loading: boolean;
  }>({
    open: false,
    expense: null,
    loading: false,
  });

  // Convert backend expense data to frontend ExpenseData format
  const convertToExpenseData = (expenses: ExpenseResponse[]): ExpenseData[] => {
    return expenses.map((expense) => {
      let status: ExpenseData["status"];
      let statusLabel: string;

      switch (expense.status) {
        case "PENDING_FINANCE":
          status = "pending";
          statusLabel = "Manager Approved";
          break;
        case "PAID":
          status = "paid";
          statusLabel = "Paid";
          break;
        case "REJECTED_FINANCE":
          status = "rejected";
          statusLabel = "Rejected by Finance";
          break;
        default:
          status = "pending";
          statusLabel = expense.status;
          break;
      }

      return {
        id: expense.id.toString(),
        ref: financeExpenseApiService.getExpenseReference(expense),
        employee: expense.employeeName,
        amount: financeExpenseApiService.formatAmount(expense.amount),
        date: financeExpenseApiService.formatDate(expense.createdAt),
        status,
        statusLabel,
      };
    });
  };

  const expenses = convertToExpenseData(pendingExpenses);
  const paidExpensesData = convertToExpenseData(paidExpenses);

  const navigationTabs = [
    { id: 0, label: "Home", icon: Home, badge: null },
    {
      id: 1,
      label: "To Pay",
      icon: Clock,
      badge: stats.toPay > 0 ? stats.toPay.toString() : null,
    },
    {
      id: 2,
      label: "Paid",
      icon: CheckCircle,
      badge: stats.paid > 0 ? stats.paid.toString() : null,
    },
    {
      id: 3,
      label: "History",
      icon: DollarSign,
      badge:
        historyExpenses.length > 0 ? historyExpenses.length.toString() : null,
    },
  ];

  const handleBatchApprove = () => {
    if (selectedExpenses.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select expenses to approve.",
        variant: "destructive",
      });
      return;
    }

    const selectedExpenseObjects = pendingExpenses.filter((expense) =>
      selectedExpenses.includes(expense.id.toString()),
    );

    setBatchActionDialog({
      expenses: selectedExpenseObjects,
      actionType: "approve",
    });
  };

  const handleBatchReject = () => {
    if (selectedExpenses.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select expenses to reject.",
        variant: "destructive",
      });
      return;
    }

    const selectedExpenseObjects = pendingExpenses.filter((expense) =>
      selectedExpenses.includes(expense.id.toString()),
    );

    setBatchActionDialog({
      expenses: selectedExpenseObjects,
      actionType: "reject",
    });
  };

  const handleSingleAction = (
    expense: ExpenseResponse,
    action: "approve" | "reject",
  ) => {
    setActionDialog({
      expense: expense,
      actionType: action,
    });
  };

  const headerActions = [
    {
      label: "🔄 Refresh",
      variant: "outline" as const,
      onClick: refreshData,
      disabled: loading,
      icon: RefreshCw,
    },
    {
      label: `✓ Approve & Pay Selected (${selectedExpenses.length})`,
      className: "bg-green-600 hover:bg-green-700 text-white",
      onClick: handleBatchApprove,
      disabled: selectedExpenses.length === 0 || loading,
    },
    {
      label: `✕ Reject Selected (${selectedExpenses.length})`,
      className: "bg-red-600 hover:bg-red-700 text-white",
      onClick: handleBatchReject,
      disabled: selectedExpenses.length === 0 || loading,
    },
  ];

  const expenseColumns: ColumnDefinition[] = [
    { key: "ref", label: "Ref" },
    { key: "employee", label: "Employee" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "statusLabel", label: "Status" },
  ];

  const statusInfo = {
    status:
      activeTab === 1
        ? "To-Pay"
        : activeTab === 2
          ? "Paid"
          : activeTab === 3
            ? "History"
            : "Overview",
    statusClassName:
      activeTab === 1
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : activeTab === 2
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : activeTab === 3
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    lastUpdated: "Just now",
  };

  const userInfo = {
    initials:
      user?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "F",
    name: user?.fullName || "Finance User",
    department: "Finance",
  };

  const handleRowAction = async (expense: ExpenseData, action: string) => {
    if (action === "approve" || action === "reject") {
      const expenseObject = pendingExpenses.find(
        (exp) => exp.id.toString() === expense.id,
      );
      if (!expenseObject) return;

      setActionDialog({
        expense: expenseObject,
        actionType: action as "approve" | "reject",
      });
    } else if (action === "view") {
      await handleViewExpense(expense);
    }
  };

  const handleViewExpense = async (expense: ExpenseData) => {
    setViewModal({ open: true, expense: null, loading: true });

    try {
      const expenseDetails = await expenseApiService.getExpenseById(
        parseInt(expense.id),
      );
      setViewModal({ open: true, expense: expenseDetails, loading: false });
    } catch (error) {
      console.error("Failed to fetch expense details:", error);
      setViewModal({ open: false, expense: null, loading: false });
      toast({
        title: "Error",
        description: "Failed to load expense details",
        variant: "destructive",
      });
    }
  };

  // Handle single expense action
  const handleSingleExpenseAction = async (
    expenseId: number,
    actionType: "approve" | "reject",
    actionData: FinanceActionRequest | FinanceRejectionRequest,
  ) => {
    try {
      if (actionType === "approve") {
        await approveExpense(expenseId, actionData as FinanceActionRequest);
        toast({
          title: "Payment Approved! 💳",
          description:
            "Expense has been approved for payment and the employee has been notified. Payment will be processed as scheduled.",
        });
      } else {
        await rejectExpense(expenseId, actionData as FinanceRejectionRequest);
        toast({
          title: "Expense Rejected",
          description:
            "Expense has been rejected and the employee has been notified with your feedback.",
        });
      }

      // Clear selections after action
      setSelectedExpenses([]);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process expense",
        variant: "destructive",
      });
    }
  };

  // Handle batch expense action
  const handleBatchExpenseAction = async (
    expenseIds: number[],
    actionType: "approve" | "reject",
    actionData: FinanceActionRequest | { comment: string },
  ) => {
    try {
      if (actionType === "approve") {
        await batchApproveExpenses(
          expenseIds,
          actionData as FinanceActionRequest,
        );
        toast({
          title: `${expenseIds.length} Payments Approved! 💳`,
          description: `All selected expenses have been approved for payment and employees have been notified. Payments will be processed as scheduled.`,
        });
      } else {
        await batchRejectExpenses(
          expenseIds,
          (actionData as { comment: string }).comment,
        );
        toast({
          title: `${expenseIds.length} Expenses Rejected`,
          description: `All selected expenses have been rejected and employees have been notified with your feedback.`,
        });
      }

      // Clear selections after action
      setSelectedExpenses([]);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process expenses",
        variant: "destructive",
      });
    }
  };

  // Close dialogs
  const closeActionDialog = () => {
    setActionDialog({ expense: null, actionType: null });
  };

  const closeBatchActionDialog = () => {
    setBatchActionDialog({ expenses: [], actionType: null });
  };

  // Show error toast if there's an API error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <>
      <DashboardLayout
        title="Finance Expense Approval"
        navigationTabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerActions={headerActions}
        statusInfo={statusInfo}
        userInfo={userInfo}
      >
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading expenses...
            </span>
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === 0 && !loading && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Finance Overview
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Total Expenses
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {financeExpenseApiService.formatAmount(stats.totalAmount)}
                </div>
              </div>
              <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  To Pay
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {financeExpenseApiService.formatAmount(stats.toPayAmount)}
                </div>
              </div>
              <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Paid
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {financeExpenseApiService.formatAmount(stats.paidAmount)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Actions Required
              </h3>
              {pendingExpenses.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No pending expenses requiring action.
                </div>
              ) : (
                <div className="space-y-3">
                  {[...pendingExpenses]
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 3)
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className="p-4 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {financeExpenseApiService.getExpenseReference(
                                expense,
                              )}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              from {expense.employeeName}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              •{" "}
                              {financeExpenseApiService.formatAmount(
                                expense.amount,
                              )}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewExpense({
                                  id: expense.id.toString(),
                                  ref: financeExpenseApiService.getExpenseReference(
                                    expense,
                                  ),
                                  employee: expense.employeeName,
                                  amount: financeExpenseApiService.formatAmount(
                                    expense.amount,
                                  ),
                                  date: financeExpenseApiService.formatDate(
                                    expense.createdAt,
                                  ),
                                  status: "pending",
                                  statusLabel: "Manager Approved",
                                })
                              }
                              disabled={loading}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleSingleAction(expense, "approve")
                              }
                              disabled={loading}
                            >
                              Approve & Pay
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() =>
                                handleSingleAction(expense, "reject")
                              }
                              disabled={loading}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TO PAY TAB */}
        {activeTab === 1 && !loading && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              To Pay
            </h2>
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No expenses awaiting payment.
              </div>
            ) : (
              <ExpenseTable
                data={expenses}
                columns={expenseColumns}
                showSelection={true}
                selectedExpenses={selectedExpenses}
                onSelectionChange={setSelectedExpenses}
                showActions={true}
                onRowAction={handleRowAction}
                actionTypes={["view", "approve", "reject"]}
              />
            )}
          </div>
        )}

        {/* PAID TAB */}
        {activeTab === 2 && !loading && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Paid Expenses
            </h2>
            {paidExpensesData.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No paid expenses yet.
              </div>
            ) : (
              <ExpenseTable
                data={paidExpensesData}
                columns={expenseColumns}
                showActions={true}
                onRowAction={handleRowAction}
                actionTypes={["view"]}
              />
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 3 && !loading && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Finance History
            </h2>
            {convertToExpenseData(historyExpenses).length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No expense history found.
              </div>
            ) : (
              <ExpenseTable
                data={convertToExpenseData(historyExpenses)}
                columns={expenseColumns}
                showActions={true}
                onRowAction={handleRowAction}
                actionTypes={["view"]}
              />
            )}
          </div>
        )}
      </DashboardLayout>

      {/* Action Dialogs */}
      <FinanceActionDialog
        expense={actionDialog.expense}
        actionType={actionDialog.actionType}
        isOpen={actionDialog.expense !== null}
        onClose={closeActionDialog}
        onAction={handleSingleExpenseAction}
      />

      <BatchFinanceActionDialog
        expenses={batchActionDialog.expenses}
        actionType={batchActionDialog.actionType}
        isOpen={batchActionDialog.expenses.length > 0}
        onClose={closeBatchActionDialog}
        onBatchAction={handleBatchExpenseAction}
      />

      <ViewExpenseModal
        isOpen={viewModal.open}
        onClose={() =>
          setViewModal({ open: false, expense: null, loading: false })
        }
        expense={viewModal.expense}
        loading={viewModal.loading}
      />
    </>
  );
}
