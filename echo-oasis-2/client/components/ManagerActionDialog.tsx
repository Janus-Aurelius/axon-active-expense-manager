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

interface ManagerActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ExpenseResponse | null;
  action: "approve" | "reject" | null;
  onConfirm: (expenseId: number, comment?: string) => Promise<void>;
  loading?: boolean;
}

export function ManagerActionDialog({
  open,
  onOpenChange,
  expense,
  action,
  onConfirm,
  loading = false,
}: ManagerActionDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!expense || !action) return;

    try {
      if (action === "reject" && !comment.trim()) {
        // Rejection requires a comment
        return;
      }

      await onConfirm(expense.id, comment.trim() || undefined);

      // Reset form and close dialog
      setComment("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
      console.error("Error in manager action:", error);
    }
  };

  const handleCancel = () => {
    setComment("");
    onOpenChange(false);
  };

  if (!expense || !action) return null;

  const isApprove = action === "approve";
  const actionLabel = isApprove ? "Approve" : "Reject";
  const actionColor = isApprove
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionLabel} Expense</DialogTitle>
          <DialogDescription>
            You are about to {action} the following expense request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Expense Details */}
          <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {expense.title}
                </h4>
                <Badge variant="outline">
                  {expenseApiService.formatAmount(expense.amount)}
                </Badge>
              </div>

              {expense.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {expense.description}
                </p>
              )}

              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Employee:{" "}
                  <span className="font-medium">{expense.employeeName}</span>
                </span>
                <span>
                  Date: {expenseApiService.formatDate(expense.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {isApprove ? "Comment (optional)" : "Rejection Reason *"}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isApprove
                  ? "Add an optional comment about this approval..."
                  : "Please provide a reason for rejection..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {!isApprove && !comment.trim() && (
              <p className="text-sm text-red-600 dark:text-red-400">
                A rejection reason is required.
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
            {loading ? "Processing..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
