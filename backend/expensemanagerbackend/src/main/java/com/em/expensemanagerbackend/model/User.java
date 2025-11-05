package com.em.expensemanagerbackend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.em.expensemanagerbackend.enums.UserRole;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // --- Relationships ---
    // A User (Employee) can have many requests
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExpenseRequest> expenseRequests = new ArrayList<>();

    // A User (Manager) can take many actions
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ManagerAction> managerActions = new ArrayList<>();

    // A User (Finance) can take many actions
    @OneToMany(mappedBy = "finance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FinanceAction> financeActions = new ArrayList<>();

    // --- Constructors ---
    public User() {
    }

    public User(String fullName, String email, String password, UserRole role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ExpenseRequest> getExpenseRequests() {
        return expenseRequests;
    }

    public void setExpenseRequests(List<ExpenseRequest> expenseRequests) {
        this.expenseRequests = expenseRequests;
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
    public void addExpenseRequest(ExpenseRequest expenseRequest) {
        expenseRequests.add(expenseRequest);
        expenseRequest.setEmployee(this);
    }

    public void addManagerAction(ManagerAction managerAction) {
        managerActions.add(managerAction);
        managerAction.setManager(this);
    }

    public void addFinanceAction(FinanceAction financeAction) {
        financeActions.add(financeAction);
        financeAction.setFinance(this);
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
        User user = (User) o;
        if (id != null ? !id.equals(user.id) : user.id != null) {
            return false;
        }
        return email != null ? email.equals(user.email) : user.email == null;
    }

    @Override
    public String toString() {
        return "User{"
                + "id=" + id
                + ", fullName='" + fullName + '\''
                + ", email='" + email + '\''
                + ", role=" + role
                + ", createdAt=" + createdAt
                + '}';
    }
}
