import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface ExpenseData {
  id: string;
  ref: string;
  employee: string;
  amount: string;
  date: string;
  status: "pending" | "approved" | "paid" | "rejected";
  statusLabel: string;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: ExpenseData) => React.ReactNode;
}

interface ExpenseTableProps {
  data: ExpenseData[];
  columns: ColumnDefinition[];
  showSelection?: boolean;
  selectedExpenses?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowAction?: (expense: ExpenseData, action: string) => void;
  showActions?: boolean;
  isDarkMode?: boolean;
  actionTypes?: ("view" | "approve" | "reject" | "edit" | "delete")[];
}

export default function ExpenseTable({
  data,
  columns,
  showSelection = false,
  selectedExpenses = [],
  onSelectionChange,
  onRowAction,
  showActions = false,
  isDarkMode = false,
  actionTypes = ["view"],
}: ExpenseTableProps) {
  const toggleExpense = (id: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedExpenses.includes(id)
      ? selectedExpenses.filter((item) => item !== id)
      : [...selectedExpenses, id];

    onSelectionChange(newSelection);
  };

  const toggleAllExpenses = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange(data.map((exp) => exp.id));
    } else {
      onSelectionChange([]);
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "manager approved":
        return isDarkMode
          ? "bg-yellow-900 text-yellow-200"
          : "bg-yellow-100 text-yellow-800";
      case "paid":
        return isDarkMode
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-800";
      case "rejected":
        return isDarkMode
          ? "bg-red-900 text-red-200"
          : "bg-red-100 text-red-800";
      default:
        return isDarkMode
          ? "bg-gray-700 text-gray-200"
          : "bg-gray-100 text-gray-800";
    }
  };

  const renderCellContent = (
    column: ColumnDefinition,
    expense: ExpenseData,
  ) => {
    if (column.render) {
      return column.render(expense[column.key as keyof ExpenseData], expense);
    }

    const value = expense[column.key as keyof ExpenseData];

    if (column.key === "status" || column.key === "statusLabel") {
      return (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusClassName(value as string)}`}
        >
          {value}
        </span>
      );
    }

    return value;
  };

  return (
    <div
      className={`rounded-lg overflow-hidden ${
        isDarkMode
          ? "bg-slate-800 border border-slate-700"
          : "bg-white border border-gray-200"
      }`}
    >
      <table className="w-full">
        <thead
          className={`${
            isDarkMode ? "bg-slate-700" : "bg-gray-100"
          } border-b ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}
        >
          <tr>
            {showSelection && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={
                    selectedExpenses.length === data.length && data.length > 0
                  }
                  onChange={(e) => toggleAllExpenses(e.target.checked)}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } ${column.className || ""}`}
              >
                {column.label}
              </th>
            ))}
            {showActions && (
              <th
                className={`px-6 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((expense) => (
            <tr
              key={expense.id}
              className={`border-b ${
                isDarkMode
                  ? "border-slate-700 hover:bg-slate-700"
                  : "border-gray-200 hover:bg-gray-50"
              } transition-colors`}
            >
              {showSelection && (
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedExpenses.includes(expense.id)}
                    onChange={() => toggleExpense(expense.id)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 text-sm ${
                    column.key === "ref" || column.key === "amount"
                      ? `font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`
                      : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                  } ${column.className || ""}`}
                >
                  {renderCellContent(column, expense)}
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {actionTypes.includes("view") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRowAction?.(expense, "view")}
                      >
                        View
                      </Button>
                    )}
                    {expense.status === "pending" &&
                      actionTypes.includes("approve") && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onRowAction?.(expense, "approve")}
                        >
                          Approve
                        </Button>
                      )}
                    {expense.status === "pending" &&
                      actionTypes.includes("reject") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-500"
                          onClick={() => onRowAction?.(expense, "reject")}
                        >
                          Reject
                        </Button>
                      )}
                    {actionTypes.includes("edit") &&
                      expense.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRowAction?.(expense, "edit")}
                        >
                          Edit
                        </Button>
                      )}
                    {actionTypes.includes("delete") &&
                      expense.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-500"
                          onClick={() => onRowAction?.(expense, "delete")}
                        >
                          Delete
                        </Button>
                      )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div
          className={`p-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          No expenses found
        </div>
      )}
    </div>
  );
}
