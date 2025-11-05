import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExpenseResponse,
  expenseApiService,
} from "@/lib/api/employee-expense-api";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  FileText,
  User,
} from "lucide-react";

interface ViewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseResponse | null;
}

export default function ViewExpenseModal({
  isOpen,
  onClose,
  expense,
}: ViewExpenseModalProps) {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Expense Details
          </DialogTitle>
          <DialogDescription>
            View the complete details of this expense request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Status
            </span>
            <Badge
              className={`${expenseApiService.getStatusClassName(expense.status)} border-0`}
            >
              {expenseApiService.getStatusLabel(expense.status)}
            </Badge>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Title
            </span>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {expense.title}
            </p>
          </div>

          {/* Description */}
          {expense.description && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Description
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {expense.description}
              </p>
            </div>
          )}

          {/* Amount */}
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Amount
              </span>
              <p className="text-lg font-bold text-green-600">
                {expenseApiService.formatAmount(expense.amount)}
              </p>
            </div>
          </div>

          {/* Employee */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Employee
              </span>
              <p className="text-sm text-gray-900 dark:text-white">
                {expense.employeeName}
              </p>
              <p className="text-xs text-gray-500">{expense.employeeEmail}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Created
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {expenseApiService.formatDate(expense.createdAt)}
                </p>
              </div>
            </div>

            {expense.updatedAt !== expense.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Updated
                  </span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {expenseApiService.formatDate(expense.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Receipt URL */}
          {expense.receiptUrl && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Receipt
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(expense.receiptUrl, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Receipt
              </Button>
            </div>
          )}

          {/* Reference ID */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500">
              Reference ID: EXP-{expense.id.toString().padStart(3, "0")}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
