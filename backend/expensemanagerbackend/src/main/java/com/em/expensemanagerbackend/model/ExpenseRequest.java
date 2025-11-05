package com.em.expensemanagerbackend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.em.expensemanagerbackend.enums.ExpenseStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "expense_requests")
public class ExpenseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private String receiptUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status = ExpenseStatus.PENDING_MANAGER;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- Relationships ---
    // The employee who submitted this request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    // Audit trail of manager actions
    @OneToMany(mappedBy = "expenseRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ManagerAction> managerActions = new ArrayList<>();

    // Audit trail of finance actions
    @OneToMany(mappedBy = "expenseRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FinanceAction> financeActions = new ArrayList<>();

    // --- Constructors ---
    public ExpenseRequest() {
    }

    public ExpenseRequest(String title, String description, BigDecimal amount, String receiptUrl, User employee) {
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.receiptUrl = receiptUrl;
        this.employee = employee;
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

    public User getEmployee() {
        return employee;
    }

    public void setEmployee(User employee) {
        this.employee = employee;
    }

    public List<ManagerAction> getManagerActions() {
        return managerActions;
    }

    public void setManagerActions(List<ManagerAction> managerActions) {
        this.managerActions = managerActions;
    }

    public List<FinanceAction> getFinanceActions() {
        return financeActions;
    }

    public void setFinanceActions(List<FinanceAction> financeActions) {
        this.financeActions = financeActions;
    }

    // --- Helper methods ---
    public void addManagerAction(ManagerAction managerAction) {
        managerActions.add(managerAction);
        managerAction.setExpenseRequest(this);
    }

    public void addFinanceAction(FinanceAction financeAction) {
        financeActions.add(financeAction);
        financeAction.setExpenseRequest(this);
    }

    // --- equals, hashCode, toString ---
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ExpenseRequest that = (ExpenseRequest) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "ExpenseRequest{"
                + "id=" + id
                + ", title='" + title + '\''
                + ", amount=" + amount
                + ", status=" + status
                + ", createdAt=" + createdAt
                + '}';
    }
}
