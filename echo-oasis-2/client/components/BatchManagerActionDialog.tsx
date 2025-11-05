import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ExpenseResponse } from "@/lib/api/employee-expense-api";
import { expenseApiService } from "@/lib/api/employee-expense-api";

interface BatchManagerActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenses: ExpenseResponse[];
  action: "approve" | "reject" | null;
  onConfirm: (expenseIds: number[], comment?: string) => Promise<void>;
  loading?: boolean;
}

export function BatchManagerActionDialog({
  open,
  onOpenChange,
  expenses,
  action,
  onConfirm,
  loading = false,
}: BatchManagerActionDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!expenses.length || !action) return;

    try {
      if (action === "reject" && !comment.trim()) {
        // Batch rejection requires a comment
        return;
      }

      const expenseIds = expenses.map((expense) => expense.id);
      await onConfirm(expenseIds, comment.trim() || undefined);

      // Reset form and close dialog
      setComment("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
      console.error("Error in batch manager action:", error);
    }
  };

  const handleCancel = () => {
    setComment("");
    onOpenChange(false);
  };

  if (!expenses.length || !action) return null;

  const isApprove = action === "approve";
  const actionLabel = isApprove ? "Approve" : "Reject";
  const actionColor = isApprove
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700";
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Batch {actionLabel} Expenses</DialogTitle>
          <DialogDescription>
            You are about to {action} {expenses.length} expense
            {expenses.length > 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Selected Expenses ({expenses.length})
              </h4>
              <Badge variant="outline" className="text-lg">
                {expenseApiService.formatAmount(totalAmount)}
              </Badge>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <span className="font-medium">{expense.title}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      by {expense.employeeName}
                    </span>
                  </div>
                  <span className="font-medium">
                    {expenseApiService.formatAmount(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="batchComment">
              {isApprove ? "Comment (optional)" : "Rejection Reason *"}
            </Label>
            <Textarea
              id="batchComment"
              placeholder={
                isApprove
                  ? "Add an optional comment for all approvals..."
                  : "Please provide a reason for rejecting all selected expenses..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {!isApprove && !comment.trim() && (
              <p className="text-sm text-red-600 dark:text-red-400">
                A rejection reason is required for batch rejections.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            className={actionColor}
            onClick={handleSubmit}
            disabled={loading || (!isApprove && !comment.trim())}
          >
            {loading
              ? "Processing..."
              : `${actionLabel} ${expenses.length} Expense${expenses.length > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
