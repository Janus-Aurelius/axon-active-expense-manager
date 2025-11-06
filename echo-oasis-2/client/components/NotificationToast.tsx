import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NotificationToastType = "success" | "error" | "info" | "warning";

export interface NotificationToast {
  id: string;
  type: NotificationToastType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 means persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  toast: NotificationToast;
  onClose: (id: string) => void;
  isDarkMode?: boolean;
}

export function NotificationToastComponent({
  toast,
  onClose,
  isDarkMode = false,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto-close if duration is set
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          bgColor: isDarkMode
            ? "bg-green-900/20 border-green-700"
            : "bg-green-50 border-green-200",
          textColor: isDarkMode ? "text-green-200" : "text-green-800",
        };
      case "error":
        return {
          icon: AlertCircle,
          iconColor: "text-red-500",
          bgColor: isDarkMode
            ? "bg-red-900/20 border-red-700"
            : "bg-red-50 border-red-200",
          textColor: isDarkMode ? "text-red-200" : "text-red-800",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-yellow-500",
          bgColor: isDarkMode
            ? "bg-yellow-900/20 border-yellow-700"
            : "bg-yellow-50 border-yellow-200",
          textColor: isDarkMode ? "text-yellow-200" : "text-yellow-800",
        };
      case "info":
      default:
        return {
          icon: Info,
          iconColor: "text-blue-500",
          bgColor: isDarkMode
            ? "bg-blue-900/20 border-blue-700"
            : "bg-blue-50 border-blue-200",
          textColor: isDarkMode ? "text-blue-200" : "text-blue-800",
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`
        fixed top-4 right-4 max-w-sm w-full border rounded-lg shadow-lg p-4 z-50
        transform transition-all duration-300 ease-in-out
        ${styles.bgColor}
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${isLeaving ? "translate-x-full opacity-0" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />

        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${styles.textColor}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`text-sm mt-1 ${styles.textColor} opacity-80`}>
              {toast.message}
            </p>
          )}
          {toast.action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toast.action.onClick}
              className={`mt-2 h-auto p-0 ${styles.textColor} hover:${styles.textColor}`}
            >
              {toast.action.label}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className={`p-1 h-auto ${styles.textColor} hover:${styles.textColor} opacity-60 hover:opacity-100`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Toast manager hook
interface UseNotificationToastsReturn {
  toasts: NotificationToast[];
  showToast: (toast: Omit<NotificationToast, "id">) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export function useNotificationToasts(): UseNotificationToastsReturn {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const showToast = (toastData: Omit<NotificationToast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: NotificationToast = {
      id,
      duration: 5000, // default 5 seconds
      ...toastData,
    };

    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
  };
}

// Toast container component
interface NotificationToastContainerProps {
  toasts: NotificationToast[];
  onRemoveToast: (id: string) => void;
  isDarkMode?: boolean;
}

export function NotificationToastContainer({
  toasts,
  onRemoveToast,
  isDarkMode = false,
}: NotificationToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 - index,
          }}
        >
          <NotificationToastComponent
            toast={toast}
            onClose={onRemoveToast}
            isDarkMode={isDarkMode}
          />
        </div>
      ))}
    </div>
  );
}
