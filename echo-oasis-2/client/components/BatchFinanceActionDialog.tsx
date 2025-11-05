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
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSignIcon, UserIcon } from "lucide-react";
import type { ExpenseResponse } from "@/lib/api/employee-expense-api";
import type { FinanceActionRequest } from "@/lib/api/finance-expense-api";
import { financeExpenseApiService } from "@/lib/api/finance-expense-api";

interface BatchFinanceActionDialogProps {
  expenses: ExpenseResponse[];
  actionType: "approve" | "reject" | null;
  isOpen: boolean;
  onClose: () => void;
  onBatchAction: (
    expenseIds: number[],
    actionType: "approve" | "reject",
    actionData: FinanceActionRequest | { comment: string },
  ) => Promise<void>;
}

export default function BatchFinanceActionDialog({
  expenses,
  actionType,
  isOpen,
  onClose,
  onBatchAction,
}: BatchFinanceActionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Form data for batch approval
  const [approvalData, setApprovalData] = useState<FinanceActionRequest>({
    note: "",
    reimbursementMethod: "",
    expectedPayoutDate: "",
  });

  // Form data for batch rejection
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
    if (!actionType || expenses.length === 0) return;

    try {
      setLoading(true);

      const expenseIds = expenses.map((expense) => expense.id);

      if (actionType === "approve") {
        await onBatchAction(expenseIds, actionType, approvalData);
      } else {
        if (!rejectionComment.trim()) {
          throw new Error("Rejection comment is required");
        }
        await onBatchAction(expenseIds, actionType, {
          comment: rejectionComment,
        });
      }

      handleClose();
    } catch (error) {
      console.error("Error performing batch finance action:", error);
      // Error is handled by the parent component
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  if (!actionType || expenses.length === 0) return null;

  const isApproval = actionType === "approve";
  const title = isApproval
    ? `Approve & Pay ${expenses.length} Expenses`
    : `Reject ${expenses.length} Expenses`;
  const actionButtonText = isApproval ? "Approve & Pay All" : "Reject All";
  const actionButtonClass = isApproval
    ? "bg-green-600 hover:bg-green-700 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  return (
    <>
      <Dialog open={isOpen && !showConfirmDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSignIcon className="w-5 h-5" />
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Expenses Summary */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Selected Expenses</h3>
                <div className="text-lg font-bold">
                  Total: {financeExpenseApiService.formatAmount(totalAmount)}
                </div>
              </div>

              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <div className="font-medium">{expense.title}</div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {expense.employeeName}
                          </div>
                        </div>
                      </div>
                      <div className="font-medium">
                        {financeExpenseApiService.formatAmount(expense.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Action Form */}
            {isApproval ? (
              <div className="space-y-4">
                <h4 className="font-medium">Batch Payout Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These payout details will be applied to all selected expenses.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="batchReimbursementMethod">
                      Reimbursement Method
                    </Label>
                    <Input
                      id="batchReimbursementMethod"
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
                    <Label htmlFor="batchExpectedPayoutDate">
                      Expected Payout Date
                    </Label>
                    <Input
                      id="batchExpectedPayoutDate"
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
                    <Label htmlFor="batchNote">Internal Note (Optional)</Label>
                    <Textarea
                      id="batchNote"
                      placeholder="Add any internal notes about these payments..."
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
                <h4 className="font-medium">Batch Rejection Reason</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This rejection reason will be applied to all selected
                  expenses.
                </p>
                <div>
                  <Label htmlFor="batchRejectionComment">
                    Comment <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="batchRejectionComment"
                    placeholder="Please provide a reason for rejecting these expenses..."
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
              Confirm Batch {isApproval ? "Approval" : "Rejection"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isApproval ? (
                <>
                  Are you sure you want to approve and pay all {expenses.length}{" "}
                  selected expenses for a total of{" "}
                  <strong>
                    {financeExpenseApiService.formatAmount(totalAmount)}
                  </strong>
                  ?
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
                  Are you sure you want to reject all {expenses.length} selected
                  expenses for a total of{" "}
                  <strong>
                    {financeExpenseApiService.formatAmount(totalAmount)}
                  </strong>
                  ?
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
                : `Confirm ${isApproval ? "Batch Approval" : "Batch Rejection"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
