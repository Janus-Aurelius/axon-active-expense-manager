import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSignIcon, UserIcon } from "lucide-react";
import type { ExpenseResponse } from "@/lib/api/employee-expense-api";
import type {
  FinanceActionRequest,
  FinanceRejectionRequest,
} from "@/lib/api/finance-expense-api";
import { financeExpenseApiService } from "@/lib/api/finance-expense-api";

interface FinanceActionDialogProps {
  expense: ExpenseResponse | null;
  actionType: "approve" | "reject" | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (
    expenseId: number,
    actionType: "approve" | "reject",
    actionData: FinanceActionRequest | FinanceRejectionRequest,
  ) => Promise<void>;
}

export default function FinanceActionDialog({
  expense,
  actionType,
  isOpen,
  onClose,
  onAction,
}: FinanceActionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Form data for approval
  const [approvalData, setApprovalData] = useState<FinanceActionRequest>({
    note: "",
    reimbursementMethod: "",
    expectedPayoutDate: "",
  });

  // Form data for rejection
  const [rejectionComment, setRejectionComment] = useState("");

  const handleClose = () => {
    if (!loading) {
      setApprovalData({
        note: "",
        reimbursementMethod: "",
        expectedPayoutDate: "",
      });
      setRejectionComment("");
      setShowConfirmDialog(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!expense || !actionType) return;

    try {
      setLoading(true);

      if (actionType === "approve") {
        await onAction(expense.id, actionType, approvalData);
      } else {
        if (!rejectionComment.trim()) {
          throw new Error("Rejection comment is required");
        }
        await onAction(expense.id, actionType, { comment: rejectionComment });
      }

      handleClose();
    } catch (error) {
      console.error("Error performing finance action:", error);
      // Error is handled by the parent component
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  if (!expense || !actionType) return null;

  const isApproval = actionType === "approve";
  const title = isApproval ? "Approve & Pay Expense" : "Reject Expense";
  const actionButtonText = isApproval ? "Approve & Pay" : "Reject";
  const actionButtonClass = isApproval
    ? "bg-green-600 hover:bg-green-700 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  return (
    <>
      <Dialog open={isOpen && !showConfirmDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSignIcon className="w-5 h-5" />
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Expense Details */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
              <h3 className="font-medium text-lg mb-3">{expense.title}</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Employee:
                  </span>
                  <span className="font-medium">{expense.employeeName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSignIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Amount:
                  </span>
                  <span className="font-medium">
                    {financeExpenseApiService.formatAmount(expense.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Submitted:
                  </span>
                  <span className="font-medium">
                    {financeExpenseApiService.formatDate(expense.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <Badge variant="secondary">Manager Approved</Badge>
                </div>
              </div>

              {expense.description && (
                <div className="mt-3">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <strong>Description:</strong> {expense.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Form */}
            {isApproval ? (
              <div className="space-y-4">
                <h4 className="font-medium">Payout Details</h4>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="reimbursementMethod">
                      Reimbursement Method
                    </Label>
                    <Input
                      id="reimbursementMethod"
                      placeholder="e.g., Bank Transfer, Check, Direct Deposit"
                      value={approvalData.reimbursementMethod}
                      onChange={(e) =>
                        setApprovalData((prev) => ({
                          ...prev,
                          reimbursementMethod: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="expectedPayoutDate">
                      Expected Payout Date
                    </Label>
                    <Input
                      id="expectedPayoutDate"
                      type="date"
                      value={approvalData.expectedPayoutDate}
                      onChange={(e) =>
                        setApprovalData((prev) => ({
                          ...prev,
                          expectedPayoutDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="note">Internal Note (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="Add any internal notes about this payment..."
                      value={approvalData.note}
                      onChange={(e) =>
                        setApprovalData((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium">Rejection Reason</h4>
                <div>
                  <Label htmlFor="rejectionComment">
                    Comment <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="rejectionComment"
                    placeholder="Please provide a reason for rejecting this expense..."
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (!isApproval && !rejectionComment.trim())}
              className={actionButtonClass}
            >
              {actionButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {isApproval ? "Approval" : "Rejection"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isApproval ? (
                <>
                  Are you sure you want to approve and pay this expense of{" "}
                  <strong>
                    {financeExpenseApiService.formatAmount(expense.amount)}
                  </strong>{" "}
                  for {expense.employeeName}?
                  {approvalData.reimbursementMethod && (
                    <div className="mt-2 text-sm">
                      <strong>Payment Method:</strong>{" "}
                      {approvalData.reimbursementMethod}
                    </div>
                  )}
                  {approvalData.expectedPayoutDate && (
                    <div className="text-sm">
                      <strong>Expected Payout:</strong>{" "}
                      {financeExpenseApiService.formatDate(
                        approvalData.expectedPayoutDate,
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  Are you sure you want to reject this expense of{" "}
                  <strong>
                    {financeExpenseApiService.formatAmount(expense.amount)}
                  </strong>{" "}
                  for {expense.employeeName}?
                  <div className="mt-2 text-sm">
                    <strong>Reason:</strong> {rejectionComment}
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={loading}
              className={actionButtonClass}
            >
              {loading
                ? "Processing..."
                : `Confirm ${isApproval ? "Approval" : "Rejection"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
