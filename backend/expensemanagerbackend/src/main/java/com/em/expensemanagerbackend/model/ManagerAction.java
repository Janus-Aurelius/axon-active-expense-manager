package com.em.expensemanagerbackend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.em.expensemanagerbackend.enums.ManagerActionType;

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
@Table(name = "manager_actions")
public class ManagerAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private ManagerActionType action;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    private LocalDateTime actionAt;

    // --- Relationships ---
    // The request this action is for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private ExpenseRequest expenseRequest;

    // The manager who took this action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;

    // --- Constructors ---
    public ManagerAction() {
    }

    public ManagerAction(ManagerActionType action, String comment, ExpenseRequest expenseRequest, User manager) {
        this.action = action;
        this.comment = comment;
        this.expenseRequest = expenseRequest;
        this.manager = manager;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ManagerActionType getAction() {
        return action;
    }

    public void setAction(ManagerActionType action) {
        this.action = action;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
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

    public User getManager() {
        return manager;
    }

    public void setManager(User manager) {
        this.manager = manager;
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
        ManagerAction that = (ManagerAction) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }

    @Override
    public String toString() {
        return "ManagerAction{"
                + "id=" + id
                + ", action=" + action
                + ", comment='" + comment + '\''
                + ", actionAt=" + actionAt
                + '}';
    }
}
