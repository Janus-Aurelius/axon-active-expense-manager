import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ExpenseTable, {
  ExpenseData,
  ColumnDefinition,
} from "@/components/ExpenseTable";
import { ManagerActionDialog } from "@/components/ManagerActionDialog";
import { BatchManagerActionDialog } from "@/components/BatchManagerActionDialog";
import ViewExpenseModal from "@/components/ViewExpenseModal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Home,
  Clock,
  CheckCircle,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useManagerExpenses } from "@/hooks/use-manager-expenses";
import { expenseApiService } from "@/lib/api/employee-expense-api";
import type { ExpenseResponse } from "@/lib/api/employee-expense-api";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const { user } = useAuth();

  // Manager expenses hook
  const {
    pendingExpenses: pendingExpensesData,
    approvedExpenses: approvedExpensesData,
    allExpenses: allExpensesData,
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
  } = useManagerExpenses();

  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    expense: ExpenseResponse | null;
    action: "approve" | "reject" | null;
  }>({
    open: false,
    expense: null,
    action: null,
  });

  const [batchActionDialog, setBatchActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | null;
  }>({
    open: false,
    action: null,
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

  // Convert backend data to table format
  const convertExpenseToTableData = (expense: ExpenseResponse): ExpenseData => {
    // Map backend status to frontend status
    const getTableStatus = (backendStatus: string): ExpenseData["status"] => {
      switch (backendStatus) {
        case "PENDING_MANAGER":
          return "pending";
        case "PENDING_FINANCE":
          return "approved"; // Manager approved, pending finance
        case "PAID":
          return "paid";
        case "REJECTED_MANAGER":
        case "REJECTED_FINANCE":
          return "rejected";
        default:
          return "pending";
      }
    };

    return {
      id: expense.id.toString(),
      ref: `EXP-${expense.id.toString().padStart(3, "0")}`,
      employee: expense.employeeName,
      amount: expenseApiService.formatAmount(expense.amount),
      date: expenseApiService.formatDate(expense.createdAt),
      status: getTableStatus(expense.status),
      statusLabel: expenseApiService.getStatusLabel(expense.status),
    };
  };

  const pendingExpenses = pendingExpensesData.map(convertExpenseToTableData);
  const approvedExpenses = approvedExpensesData.map(convertExpenseToTableData);
  const teamExpenses = allExpensesData.map(convertExpenseToTableData);

  const navigationTabs = [
    { id: 0, label: "Home", icon: Home, badge: null },
    {
      id: 1,
      label: "Pending Review",
      icon: Clock,
      badge: stats.pendingCount > 0 ? stats.pendingCount.toString() : null,
    },
    {
      id: 2,
      label: "Approved",
      icon: CheckCircle,
      badge: stats.approvedCount > 0 ? stats.approvedCount.toString() : null,
    },
    {
      id: 3,
      label: "History",
      icon: Users,
      badge: stats.totalCount > 0 ? stats.totalCount.toString() : null,
    },
  ];

  // Handler functions
  const handleSingleAction = (
    expense: ExpenseData,
    action: "approve" | "reject",
  ) => {
    const backendExpense = pendingExpensesData.find(
      (e) => e.id.toString() === expense.id,
    );
    if (backendExpense) {
      setActionDialog({
        open: true,
        expense: backendExpense,
        action,
      });
    }
  };

  const handleBatchAction = (action: "approve" | "reject") => {
    if (selectedExpenses.length === 0) return;

    setBatchActionDialog({
      open: true,
      action,
    });
  };

  const handleSingleActionConfirm = async (
    expenseId: number,
    comment?: string,
  ) => {
    if (actionDialog.action === "approve") {
      await approveExpense(expenseId, comment);
    } else if (actionDialog.action === "reject" && comment) {
      await rejectExpense(expenseId, comment);
    }
  };

  const handleBatchActionConfirm = async (
    expenseIds: number[],
    comment?: string,
  ) => {
    if (batchActionDialog.action === "approve") {
      await batchApproveExpenses(expenseIds, comment);
    } else if (batchActionDialog.action === "reject" && comment) {
      await batchRejectExpenses(expenseIds, comment);
    }
    // Clear selection after batch operation
    setSelectedExpenses([]);
  };

  const getSelectedExpensesData = (): ExpenseResponse[] => {
    return selectedExpenses
      .map((id) => pendingExpensesData.find((e) => e.id.toString() === id))
      .filter(Boolean) as ExpenseResponse[];
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
      label: `✓ Approve Selected (${selectedExpenses.length})`,
      className: "bg-green-600 hover:bg-green-700 text-white",
      onClick: () => handleBatchAction("approve"),
      disabled: selectedExpenses.length === 0 || loadingApprove,
    },
    {
      label: `✕ Reject Selected (${selectedExpenses.length})`,
      className: "bg-red-600 hover:bg-red-700 text-white",
      onClick: () => handleBatchAction("reject"),
      disabled: selectedExpenses.length === 0 || loadingReject,
    },
  ];

  const expenseColumns: ColumnDefinition[] = [
    { key: "ref", label: "Reference" },
    { key: "employee", label: "Employee" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "statusLabel", label: "Status" },
  ];

  const statusInfo = {
    status:
      activeTab === 1
        ? "Pending Review"
        : activeTab === 2
          ? "Approved"
          : activeTab === 3
            ? "History"
            : "Overview",
    statusClassName:
      activeTab === 1
        ? "bg-yellow-100 text-yellow-800"
        : activeTab === 2
          ? "bg-green-100 text-green-800"
          : activeTab === 3
            ? "bg-purple-100 text-purple-800"
            : "bg-blue-100 text-blue-800",
    lastUpdated: "Just now",
  };

  const userInfo = {
    initials:
      user?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "M",
    name: user?.fullName || "Manager",
    department: "Management",
  };

  const handleRowAction = async (expense: ExpenseData, action: string) => {
    if (action === "approve" || action === "reject") {
      handleSingleAction(expense, action as "approve" | "reject");
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
      // You might want to show an error toast here
    }
  };

  return (
    <DashboardLayout
      title="Manager Expense Review"
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
            Team Overview
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Team Expenses
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {expenseApiService.formatAmount(stats.totalAmount)}
              </div>
            </div>
            <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Pending Review
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {expenseApiService.formatAmount(stats.pendingAmount)}
              </div>
            </div>
            <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Approved
              </div>
              <div className="text-2xl font-bold text-green-600">
                {expenseApiService.formatAmount(stats.approvedAmount)}
              </div>
            </div>
            <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Requests
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalCount}
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
                {pendingExpenses.slice(0, 3).map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {expense.ref}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          from {expense.employee}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          • {expense.amount}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleSingleAction(expense, "approve")}
                          disabled={loadingApprove}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleSingleAction(expense, "reject")}
                          disabled={loadingReject}
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

      {/* PENDING REVIEW TAB */}
      {activeTab === 1 && !loading && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Pending Review
          </h2>
          {pendingExpenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No expenses pending review.
            </div>
          ) : (
            <ExpenseTable
              data={pendingExpenses}
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

      {/* APPROVED TAB */}
      {activeTab === 2 && !loading && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Approved Expenses
          </h2>
          {approvedExpenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No approved expenses.
            </div>
          ) : (
            <ExpenseTable
              data={approvedExpenses}
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
            Expense History
          </h2>
          {teamExpenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No expense history found.
            </div>
          ) : (
            <ExpenseTable
              data={teamExpenses}
              columns={expenseColumns}
              showActions={true}
              onRowAction={handleRowAction}
              actionTypes={["view"]}
            />
          )}
        </div>
      )}

      {/* Action Dialogs */}
      <ManagerActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
        expense={actionDialog.expense}
        action={actionDialog.action}
        onConfirm={handleSingleActionConfirm}
        loading={loadingApprove || loadingReject}
      />

      <BatchManagerActionDialog
        open={batchActionDialog.open}
        onOpenChange={(open) =>
          setBatchActionDialog((prev) => ({ ...prev, open }))
        }
        expenses={getSelectedExpensesData()}
        action={batchActionDialog.action}
        onConfirm={handleBatchActionConfirm}
        loading={loadingApprove || loadingReject}
      />

      <ViewExpenseModal
        isOpen={viewModal.open}
        onClose={() =>
          setViewModal({ open: false, expense: null, loading: false })
        }
        expense={viewModal.expense}
        loading={viewModal.loading}
      />
    </DashboardLayout>
  );
}
