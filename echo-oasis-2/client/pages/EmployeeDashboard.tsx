import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import ExpenseTable, {
  ExpenseData,
  ColumnDefinition,
} from "@/components/ExpenseTable";
import ExpenseForm from "@/components/ExpenseForm";
import ViewExpenseModal from "@/components/ViewExpenseModal";
import DeleteExpenseDialog from "@/components/DeleteExpenseDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Plus,
  Clock,
  CheckCircle,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  expenseApiService,
  ExpenseResponse,
  CreateExpenseRequest,
  ExpenseStatus,
} from "@/lib/api/employee-expense-api";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Ensure dev role is set for API calls
  useEffect(() => {
    const devRole = localStorage.getItem("dev-role");
    if (!devRole) {
      localStorage.setItem("dev-role", "EMPLOYEE");
    }
  }, []);

  // Fetch all expenses
  const {
    data: allExpenses = [],
    isLoading: isLoadingExpenses,
    error: expensesError,
  } = useQuery({
    queryKey: ["expenses", "my-expenses"],
    queryFn: () => expenseApiService.getMyExpenses(),
    refetchOnWindowFocus: false,
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: (expense: CreateExpenseRequest) =>
      expenseApiService.createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({
      id,
      expense,
    }: {
      id: number;
      expense: CreateExpenseRequest;
    }) => expenseApiService.updateExpense(id, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => expenseApiService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  // Transform API data to ExpenseData format
  const transformExpenseData = (expenses: ExpenseResponse[]): ExpenseData[] => {
    return expenses.map((expense) => ({
      id: expense.id.toString(),
      ref: `EXP-${expense.id.toString().padStart(3, "0")}`,
      employee: "Me",
      amount: expenseApiService.formatAmount(expense.amount),
      date: expenseApiService.formatDate(expense.createdAt),
      status: getStatusKey(expense.status),
      statusLabel: expenseApiService.getStatusLabel(expense.status),
    }));
  };

  // Helper function to convert ExpenseStatus to status key for ExpenseData
  const getStatusKey = (
    status: ExpenseStatus,
  ): "pending" | "approved" | "paid" | "rejected" => {
    switch (status) {
      case ExpenseStatus.PENDING_MANAGER:
      case ExpenseStatus.PENDING_FINANCE:
        return "pending";
      case ExpenseStatus.APPROVED_MANAGER:
        return "approved";
      case ExpenseStatus.PAID:
        return "paid";
      case ExpenseStatus.REJECTED_MANAGER:
      case ExpenseStatus.REJECTED_FINANCE:
        return "rejected";
      default:
        return "pending";
    }
  };

  // Filter expenses by status and transform
  const myExpenses = transformExpenseData(allExpenses);
  const approvedExpenses = transformExpenseData(
    allExpenses.filter(
      (exp) =>
        exp.status === ExpenseStatus.APPROVED_MANAGER ||
        exp.status === ExpenseStatus.PENDING_FINANCE,
    ),
  );
  const paidExpenses = transformExpenseData(
    allExpenses.filter((exp) => exp.status === ExpenseStatus.PAID),
  );

  // Event handlers
  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: ExpenseResponse) => {
    setSelectedExpense(expense);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleViewExpense = (expense: ExpenseResponse) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  const handleDeleteExpense = (expense: ExpenseResponse) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (expenseData: CreateExpenseRequest) => {
    if (isEditing && selectedExpense) {
      await updateExpenseMutation.mutateAsync({
        id: selectedExpense.id,
        expense: expenseData,
      });
    } else {
      await createExpenseMutation.mutateAsync(expenseData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedExpense) {
      await deleteExpenseMutation.mutateAsync(selectedExpense.id);
    }
  };

  const navigationTabs = [
    { id: 0, label: "Home", icon: Home, badge: null },
    {
      id: 1,
      label: "My Expenses",
      icon: DollarSign,
      badge: myExpenses.length.toString(),
    },
    {
      id: 2,
      label: "Approved",
      icon: CheckCircle,
      badge: approvedExpenses.length.toString(),
    },
    {
      id: 3,
      label: "Paid",
      icon: Clock,
      badge: paidExpenses.length.toString(),
    },
  ];

  const headerActions = [
    {
      label: "➕ New Expense",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
      onClick: handleCreateExpense,
    },
    {
      label: "📊 Reports",
      variant: "outline" as const,
      onClick: () => console.log("View reports"),
    },
  ];

  const expenseColumns: ColumnDefinition[] = [
    { key: "ref", label: "Reference" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "statusLabel", label: "Status" },
  ];

  const statusInfo = {
    status:
      activeTab === 1
        ? "Draft & Pending"
        : activeTab === 2
          ? "Approved"
          : "Paid",
    statusClassName:
      activeTab === 1
        ? "bg-yellow-100 text-yellow-800"
        : activeTab === 2
          ? "bg-blue-100 text-blue-800"
          : "bg-green-100 text-green-800",
    lastUpdated: "Just now",
  };

  const userInfo = {
    initials:
      user?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U",
    name: user?.fullName || "User",
    department: "Employee",
  };

  const handleRowAction = (expense: ExpenseData, action: string) => {
    // Find the actual expense from API data
    const actualExpense = allExpenses.find(
      (e) => e.id.toString() === expense.id,
    );
    if (!actualExpense) return;

    switch (action) {
      case "view":
        handleViewExpense(actualExpense);
        break;
      case "edit":
        if (expenseApiService.canEditExpense(actualExpense.status)) {
          handleEditExpense(actualExpense);
        } else {
          toast({
            title: "Cannot Edit",
            description: "This expense cannot be edited in its current status.",
            variant: "destructive",
          });
        }
        break;
      case "delete":
        if (expenseApiService.canDeleteExpense(actualExpense.status)) {
          handleDeleteExpense(actualExpense);
        } else {
          toast({
            title: "Cannot Delete",
            description:
              "This expense cannot be deleted in its current status.",
            variant: "destructive",
          });
        }
        break;
      default:
        console.log(`${action} expense:`, expense);
    }
  };

  return (
    <DashboardLayout
      title="Employee Expense Dashboard"
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerActions={headerActions}
      statusInfo={statusInfo}
      userInfo={userInfo}
    >
      {/* HOME TAB */}
      {activeTab === 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Overview
          </h2>

          {isLoadingExpenses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading expenses...
              </span>
            </div>
          ) : expensesError ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">
                Error loading expenses: {expensesError.message}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["expenses"] })
                }
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Total Expenses
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {expenseApiService.formatAmount(
                      allExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                    )}
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Pending Approval
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {expenseApiService.formatAmount(
                      allExpenses
                        .filter(
                          (exp) =>
                            exp.status === ExpenseStatus.PENDING_MANAGER ||
                            exp.status === ExpenseStatus.PENDING_FINANCE,
                        )
                        .reduce((sum, exp) => sum + exp.amount, 0),
                    )}
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Reimbursed
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {expenseApiService.formatAmount(
                      allExpenses
                        .filter((exp) => exp.status === ExpenseStatus.PAID)
                        .reduce((sum, exp) => sum + exp.amount, 0),
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {allExpenses
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                    )
                    .slice(0, 3)
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className="p-4 rounded-lg bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              EXP-{expense.id.toString().padStart(3, "0")}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {expense.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {expenseApiService.formatDate(expense.updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  {allExpenses.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No expenses yet. Create your first expense to get
                        started!
                      </p>
                      <Button onClick={handleCreateExpense} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Expense
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* MY EXPENSES TAB */}
      {activeTab === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            My Expenses
          </h2>
          {isLoadingExpenses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading expenses...
              </span>
            </div>
          ) : (
            <ExpenseTable
              data={myExpenses}
              columns={expenseColumns}
              showSelection={true}
              selectedExpenses={selectedExpenses}
              onSelectionChange={setSelectedExpenses}
              showActions={true}
              onRowAction={handleRowAction}
            />
          )}
        </div>
      )}

      {/* APPROVED TAB */}
      {activeTab === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Approved Expenses
          </h2>
          {isLoadingExpenses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading expenses...
              </span>
            </div>
          ) : (
            <ExpenseTable
              data={approvedExpenses}
              columns={expenseColumns}
              showActions={true}
              onRowAction={handleRowAction}
            />
          )}
        </div>
      )}

      {/* PAID TAB */}
      {activeTab === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Paid Expenses
          </h2>
          {isLoadingExpenses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading expenses...
              </span>
            </div>
          ) : (
            <ExpenseTable
              data={paidExpenses}
              columns={expenseColumns}
              showActions={true}
              onRowAction={handleRowAction}
            />
          )}
        </div>
      )}

      {/* MODALS */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={isEditing ? selectedExpense : null}
        title={isEditing ? "Edit Expense" : "Create New Expense"}
        isLoading={
          createExpenseMutation.isPending || updateExpenseMutation.isPending
        }
      />

      <ViewExpenseModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        expense={selectedExpense}
      />

      <DeleteExpenseDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        expense={selectedExpense}
        isLoading={deleteExpenseMutation.isPending}
      />
    </DashboardLayout>
  );
}
