import React, { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/use-notifications";
import { notificationApiService } from "@/lib/api/notification-api";
import type { NotificationResponse } from "@/lib/api/notification-api";

interface NotificationBellProps {
  isDarkMode?: boolean;
}

export default function NotificationBell({
  isDarkMode = false,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (
    notification: NotificationResponse,
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Optionally navigate to related expense if applicable
    if (notification.expenseRequestId) {
      // Could implement navigation logic here
      console.log("Navigate to expense:", notification.expenseRequestId);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const renderNotificationIcon = (notification: NotificationResponse) => {
    const style = notificationApiService.getNotificationStyle(
      notification.type,
    );
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bgColor}`}
      >
        <span className="text-lg">{style.icon}</span>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        className={`relative ${
          isDarkMode
            ? "border-slate-600 text-white hover:bg-slate-700"
            : "border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 px-1 min-w-[20px] h-5 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute right-0 top-full mt-2 w-96 rounded-lg shadow-lg border z-50 ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            <h3
              className={`font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className={`text-xs ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-slate-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className={`${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-slate-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p
                  className={`mt-2 text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Loading notifications...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshNotifications}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell
                  className={`w-8 h-8 mx-auto mb-2 ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      isDarkMode ? "border-slate-700" : "border-gray-100"
                    } ${
                      !notification.isRead
                        ? isDarkMode
                          ? "bg-slate-700/50"
                          : "bg-blue-50"
                        : ""
                    } ${
                      isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {renderNotificationIcon(notification)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4
                            className={`font-medium text-sm ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p
                          className={`text-xs mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {notificationApiService.formatTimestamp(
                              notification.createdAt,
                            )}
                          </span>
                          {notification.triggeredByName && (
                            <span
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              by {notification.triggeredByName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length > 10 && (
                  <div className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${
                        isDarkMode
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      View all notifications
                    </Button>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
