package com.em.expensemanagerbackend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.em.expensemanagerbackend.enums.FinanceActionType;

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
import jakarta.persistence.Table;

@Entity
@Table(name = "finance_actions")
public class FinanceAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private FinanceActionType action;

    private String paymentReference;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    private LocalDateTime actionAt;

    // --- Relationships ---
    // The request this action is for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private ExpenseRequest expenseRequest;

    // The finance person who took this action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finance_id", nullable = false)
    private User finance;

    // --- Constructors ---
    public FinanceAction() {
    }

    public FinanceAction(FinanceActionType action, String paymentReference, String note, ExpenseRequest expenseRequest, User finance) {
        this.action = action;
        this.paymentReference = paymentReference;
        this.note = note;
        this.expenseRequest = expenseRequest;
        this.finance = finance;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FinanceActionType getAction() {
        return action;
    }

    public void setAction(FinanceActionType action) {
        this.action = action;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getActionAt() {
        return actionAt;
    }

    public void setActionAt(LocalDateTime actionAt) {
        this.actionAt = actionAt;
    }

    public ExpenseRequest getExpenseRequest() {
        return expenseRequest;
    }

    public void setExpenseRequest(ExpenseRequest expenseRequest) {
        this.expenseRequest = expenseRequest;
    }

    public User getFinance() {
        return finance;
    }

    public void setFinance(User finance) {
        this.finance = finance;
    }

    // --- equals, toString ---
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        FinanceAction that = (FinanceAction) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }

    @Override
    public String toString() {
        return "FinanceAction{"
                + "id=" + id
                + ", action=" + action
                + ", paymentReference='" + paymentReference + '\''
                + ", note='" + note + '\''
                + ", actionAt=" + actionAt
                + '}';
    }
}
