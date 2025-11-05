package com.em.expensemanagerbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.em.expensemanagerbackend.enums.ExpenseStatus;

public class ExpenseRequestResponseDto {

    private Long id;
    private String title;
    private String description;
    private BigDecimal amount;
    private String receiptUrl;
    private ExpenseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String employeeName;
    private String employeeEmail;

    // Constructors
    public ExpenseRequestResponseDto() {
    }

    public ExpenseRequestResponseDto(Long id, String title, String description, BigDecimal amount,
            String receiptUrl, ExpenseStatus status, LocalDateTime createdAt,
            LocalDateTime updatedAt, String employeeName, String employeeEmail) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.receiptUrl = receiptUrl;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.employeeName = employeeName;
        this.employeeEmail = employeeEmail;
    }

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public ExpenseStatus getStatus() {
        return status;
    }

    public void setStatus(ExpenseStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeEmail() {
        return employeeEmail;
    }

    public void setEmployeeEmail(String employeeEmail) {
        this.employeeEmail = employeeEmail;
    }
}
