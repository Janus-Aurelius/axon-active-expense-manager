package com.em.expensemanagerbackend.dto;

import java.time.LocalDateTime;

import com.em.expensemanagerbackend.enums.NotificationType;

public class NotificationResponseDto {

    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;

    // Related expense information (if applicable)
    private Long expenseRequestId;
    private String expenseTitle;

    // Who triggered this notification (if applicable)
    private String triggeredByName;

    // --- Constructors ---
    public NotificationResponseDto() {
    }

    public NotificationResponseDto(Long id, String title, String message, NotificationType type,
            boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getExpenseRequestId() {
        return expenseRequestId;
    }

    public void setExpenseRequestId(Long expenseRequestId) {
        this.expenseRequestId = expenseRequestId;
    }

    public String getExpenseTitle() {
        return expenseTitle;
    }

    public void setExpenseTitle(String expenseTitle) {
        this.expenseTitle = expenseTitle;
    }

    public String getTriggeredByName() {
        return triggeredByName;
    }

    public void setTriggeredByName(String triggeredByName) {
        this.triggeredByName = triggeredByName;
    }
}
