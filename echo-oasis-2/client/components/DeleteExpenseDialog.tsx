import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ExpenseResponse,
  expenseApiService,
} from "@/lib/api/employee-expense-api";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  expense: ExpenseResponse | null;
  isLoading?: boolean;
}

export default function DeleteExpenseDialog({
  isOpen,
  onClose,
  onConfirm,
  expense,
  isLoading = false,
}: DeleteExpenseDialogProps) {
  if (!expense) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Delete confirmation error:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Expense
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this expense request? This action
              cannot be undone.
            </p>
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {expense.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Amount: {expenseApiService.formatAmount(expense.amount)}
              </p>
              <p className="text-xs text-gray-500">
                Reference: EXP-{expense.id.toString().padStart(3, "0")}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Expense
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
