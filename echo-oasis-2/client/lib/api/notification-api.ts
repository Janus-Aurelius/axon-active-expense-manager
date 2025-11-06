// Notification API types and service
export type NotificationType =
  | "EXPENSE_APPROVED_BY_MANAGER"
  | "EXPENSE_REJECTED_BY_MANAGER"
  | "EXPENSE_APPROVED_BY_FINANCE"
  | "EXPENSE_REJECTED_BY_FINANCE"
  | "EXPENSE_PAID"
  | "NEW_EXPENSE_SUBMITTED"
  | "EXPENSE_PENDING_FINANCE_APPROVAL";

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  expenseRequestId?: number;
  expenseTitle?: string;
  triggeredByName?: string;
}

class NotificationApiService {
  private baseUrl = "/api/notifications";

  private async getHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized - could redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }

      // For ping-based notifications, just return empty data if endpoint fails
      console.warn("Notification endpoint failed, using ping-based system");
      return [] as T;
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    try {
      return response.json();
    } catch (e) {
      // If JSON parsing fails, return empty data for ping-based system
      console.warn("JSON parsing failed, using ping-based notification system");
      return [] as T;
    }
  }

  /**
   * Get all notifications for the current user (ping-based system returns empty)
   */
  async getAllNotifications(): Promise<NotificationResponse[]> {
    // Ping-based system doesn't store notifications
    return [];
  }

  /**
   * Get unread notifications for the current user (ping-based system returns empty)
   */
  async getUnreadNotifications(): Promise<NotificationResponse[]> {
    // Ping-based system doesn't store notifications
    return [];
  }

  /**
   * Get unread notification count for the current user (ping-based system returns 0)
   */
  async getUnreadNotificationCount(): Promise<number> {
    // Ping-based system doesn't store notification counts
    return 0;
  }

  /**
   * Mark a specific notification as read (ping-based system does nothing)
   */
  async markNotificationAsRead(notificationId: number): Promise<void> {
    // Ping-based system doesn't store notifications to mark as read
    console.log("Ping: Notification marked as read (no storage)");
  }

  /**
   * Mark all notifications as read for the current user (ping-based system does nothing)
   */
  async markAllNotificationsAsRead(): Promise<void> {
    // Ping-based system doesn't store notifications to mark as read
    console.log("Ping: All notifications marked as read (no storage)");
  }

  /**
   * Get notification icon and styling based on type
   */
  getNotificationStyle(type: NotificationType): {
    icon: string;
    color: string;
    bgColor: string;
  } {
    switch (type) {
      case "NEW_EXPENSE_SUBMITTED":
        return {
          icon: "📝",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "EXPENSE_APPROVED_BY_MANAGER":
        return {
          icon: "✅",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "EXPENSE_REJECTED_BY_MANAGER":
        return {
          icon: "❌",
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      case "EXPENSE_PENDING_FINANCE_APPROVAL":
        return {
          icon: "💰",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "EXPENSE_APPROVED_BY_FINANCE":
        return {
          icon: "💳",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "EXPENSE_REJECTED_BY_FINANCE":
        return {
          icon: "💔",
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      case "EXPENSE_PAID":
        return {
          icon: "🎉",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
      default:
        return {
          icon: "📢",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  }

  /**
   * Format notification timestamp
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const notificationApiService = new NotificationApiService();
