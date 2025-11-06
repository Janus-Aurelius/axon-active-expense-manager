package com.em.expensemanagerbackend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.em.expensemanagerbackend.model.ExpenseRequest;
import com.em.expensemanagerbackend.model.User;

@Service
public class NotificationService {

    /**
     * Notify managers of new expense submission
     */
    public void notifyManagersOfNewExpense(ExpenseRequest expenseRequest) {
        System.out.println("🔔 PING: New expense submitted: " + expenseRequest.getTitle()
                + " for $" + expenseRequest.getAmount() + " by " + expenseRequest.getEmployee().getFullName());

        // Create notification data
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "expense-submitted");
        notificationData.put("title", "New Expense Submitted");
        notificationData.put("message", expenseRequest.getEmployee().getFullName() + " submitted a new expense: " + expenseRequest.getTitle());
        notificationData.put("expenseId", expenseRequest.getId());
        notificationData.put("expenseTitle", expenseRequest.getTitle());
        notificationData.put("amount", expenseRequest.getAmount());
        notificationData.put("employeeName", expenseRequest.getEmployee().getFullName());
        notificationData.put("targetRole", "MANAGER");

        // Broadcast to all users (managers will filter on frontend)
    }

    /**
     * Notify employee and finance team of manager approval
     */
    public void notifyExpenseApprovedByManager(ExpenseRequest expenseRequest, User manager) {
        System.out.println("🔔 PING: Expense approved by manager: " + expenseRequest.getTitle()
                + " - Employee and Finance team notified");

        // Notify employee
        Map<String, Object> employeeNotification = new HashMap<>();
        employeeNotification.put("type", "expense-approved-by-manager");
        employeeNotification.put("title", "Expense Approved by Manager");
        employeeNotification.put("message", "Your expense '" + expenseRequest.getTitle() + "' has been approved by " + manager.getFullName() + " and sent to Finance.");
        employeeNotification.put("expenseId", expenseRequest.getId());
        employeeNotification.put("expenseTitle", expenseRequest.getTitle());
        employeeNotification.put("managerName", manager.getFullName());
        employeeNotification.put("targetRole", "EMPLOYEE");
        employeeNotification.put("targetUserId", expenseRequest.getEmployee().getId());

        // Notify finance team
        Map<String, Object> financeNotification = new HashMap<>();
        financeNotification.put("type", "expense-pending-finance");
        financeNotification.put("title", "New Expense Awaiting Finance Approval");
        financeNotification.put("message", "Expense '" + expenseRequest.getTitle() + "' approved by manager " + manager.getFullName() + " awaits your review.");
        financeNotification.put("expenseId", expenseRequest.getId());
        financeNotification.put("expenseTitle", expenseRequest.getTitle());
        financeNotification.put("employeeName", expenseRequest.getEmployee().getFullName());
        financeNotification.put("managerName", manager.getFullName());
        financeNotification.put("targetRole", "FINANCE");

        // Broadcast both notifications
    }

    /**
     * Notify employee of manager rejection
     */
    public void notifyExpenseRejectedByManager(ExpenseRequest expenseRequest, User manager, String reason) {
        System.out.println("🔔 PING: Expense rejected by manager: " + expenseRequest.getTitle()
                + " - Reason: " + reason);

        // Create notification data for employee
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "expense-rejected-by-manager");
        notificationData.put("title", "Expense Rejected by Manager");
        notificationData.put("message", "Your expense '" + expenseRequest.getTitle() + "' has been rejected by " + manager.getFullName());
        notificationData.put("expenseId", expenseRequest.getId());
        notificationData.put("expenseTitle", expenseRequest.getTitle());
        notificationData.put("managerName", manager.getFullName());
        notificationData.put("reason", reason);
        notificationData.put("targetRole", "EMPLOYEE");
        notificationData.put("targetUserId", expenseRequest.getEmployee().getId());

        // Broadcast notification
    }

    /**
     * Notify employee of finance approval
     */
    public void notifyExpenseApprovedByFinance(ExpenseRequest expenseRequest, User financeUser) {
        System.out.println("🔔 PING: Expense payment approved: " + expenseRequest.getTitle()
                + " - Employee notified");

        // Create notification data for employee
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "expense-paid");
        notificationData.put("title", "Expense Payment Approved");
        notificationData.put("message", "Your expense '" + expenseRequest.getTitle() + "' has been approved for payment by Finance.");
        notificationData.put("expenseId", expenseRequest.getId());
        notificationData.put("expenseTitle", expenseRequest.getTitle());
        notificationData.put("amount", expenseRequest.getAmount());
        notificationData.put("financeUserName", financeUser.getFullName());
        notificationData.put("targetRole", "EMPLOYEE");
        notificationData.put("targetUserId", expenseRequest.getEmployee().getId());

        // Broadcast notification
    }

    /**
     * Notify employee of finance rejection
     */
    public void notifyExpenseRejectedByFinance(ExpenseRequest expenseRequest, User financeUser, String reason) {
        System.out.println("🔔 PING: Expense payment rejected: " + expenseRequest.getTitle()
                + " - Reason: " + reason);

        // Create notification data for employee
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "expense-rejected-by-finance");
        notificationData.put("title", "Expense Payment Rejected");
        notificationData.put("message", "Your expense '" + expenseRequest.getTitle() + "' has been rejected by Finance.");
        notificationData.put("expenseId", expenseRequest.getId());
        notificationData.put("expenseTitle", expenseRequest.getTitle());
        notificationData.put("financeUserName", financeUser.getFullName());
        notificationData.put("reason", reason);
        notificationData.put("targetRole", "EMPLOYEE");
        notificationData.put("targetUserId", expenseRequest.getEmployee().getId());

        // Broadcast notification
    }
}
