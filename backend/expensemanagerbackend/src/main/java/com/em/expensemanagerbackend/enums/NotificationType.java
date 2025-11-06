package com.em.expensemanagerbackend.enums;

public enum NotificationType {
    // Employee notifications
    EXPENSE_APPROVED_BY_MANAGER,
    EXPENSE_REJECTED_BY_MANAGER,
    EXPENSE_APPROVED_BY_FINANCE,
    EXPENSE_REJECTED_BY_FINANCE,
    EXPENSE_PAID,
    // Manager notifications
    NEW_EXPENSE_SUBMITTED,
    // Finance notifications
    EXPENSE_PENDING_FINANCE_APPROVAL
}
