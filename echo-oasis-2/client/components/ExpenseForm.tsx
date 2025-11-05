import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateExpenseRequest,
  ExpenseResponse,
} from "@/lib/api/employee-expense-api";
import { Loader2 } from "lucide-react";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: CreateExpenseRequest) => Promise<void>;
  initialData?: ExpenseResponse | null;
  title?: string;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  amount: string;
  receiptUrl: string;
}

export default function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = "Create New Expense",
  isLoading = false,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      amount: initialData?.amount?.toString() || "",
      receiptUrl: initialData?.receiptUrl || "",
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset({
        title: initialData?.title || "",
        description: initialData?.description || "",
        amount: initialData?.amount?.toString() || "",
        receiptUrl: initialData?.receiptUrl || "",
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      const expense: CreateExpenseRequest = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        amount: parseFloat(data.amount),
        receiptUrl: data.receiptUrl?.trim() || undefined,
      };

      await onSubmit(expense);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the expense details below."
              : "Fill in the details for your new expense request."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Business lunch, Travel expenses"
              {...register("title", {
                required: "Title is required",
                maxLength: {
                  value: 255,
                  message: "Title must not exceed 255 characters",
                },
              })}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about this expense..."
              rows={3}
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must not exceed 500 characters",
                },
              })}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount ($) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                min: {
                  value: 0.01,
                  message: "Amount must be greater than 0",
                },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message:
                    "Please enter a valid amount (up to 2 decimal places)",
                },
              })}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptUrl">Receipt URL</Label>
            <Input
              id="receiptUrl"
              type="url"
              placeholder="https://example.com/receipt.pdf"
              {...register("receiptUrl", {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message:
                    "Please enter a valid URL starting with http:// or https://",
                },
              })}
              className={errors.receiptUrl ? "border-red-500" : ""}
            />
            {errors.receiptUrl && (
              <p className="text-sm text-red-500">
                {errors.receiptUrl.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Optional: Link to your receipt image or document
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Expense" : "Create Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
