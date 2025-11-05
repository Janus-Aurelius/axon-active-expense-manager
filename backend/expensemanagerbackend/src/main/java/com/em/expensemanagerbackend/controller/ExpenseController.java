package com.em.expensemanagerbackend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.em.expensemanagerbackend.dto.CreateExpenseRequestDto;
import com.em.expensemanagerbackend.dto.ExpenseRequestResponseDto;
import com.em.expensemanagerbackend.dto.FinanceActionRequestDto;
import com.em.expensemanagerbackend.dto.FinanceRejectionRequestDto;
import com.em.expensemanagerbackend.dto.ManagerActionRequestDto;
import com.em.expensemanagerbackend.dto.MessageResponse;
import com.em.expensemanagerbackend.service.ExpenseService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    /**
     * Create a new expense request
     */
    @PostMapping
    public ResponseEntity<?> createExpenseRequest(@Valid @RequestBody CreateExpenseRequestDto createDto) {
        try {
            ExpenseRequestResponseDto responseDto = expenseService.createExpenseRequest(createDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating expense: " + e.getMessage()));
        }
    }

    /**
     * Get all expenses for the current user
     */
    @GetMapping("/my-expenses")
    public ResponseEntity<?> getCurrentUserExpenses() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getCurrentUserExpenses();
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error retrieving expenses: " + e.getMessage()));
        }
    }

    /**
     * Get pending expenses for the current user
     */
    @GetMapping("/my-pending")
    public ResponseEntity<?> getCurrentUserPendingExpenses() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getCurrentUserPendingExpenses();
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error retrieving pending expenses: " + e.getMessage()));
        }
    }

    /**
     * Get rejected expenses for the current user
     */
    @GetMapping("/my-rejected")
    public ResponseEntity<?> getCurrentUserRejectedExpenses() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getCurrentUserRejectedExpenses();
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error retrieving rejected expenses: " + e.getMessage()));
        }
    }

    /**
     * Get expense by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id) {
        try {
            ExpenseRequestResponseDto expense = expenseService.getExpenseById(id);
            return ResponseEntity.ok(expense);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expense not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().equals("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access denied"));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error retrieving expense: " + e.getMessage()));
            }
        }
    }

    /**
     * Update a pending expense
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePendingExpense(@PathVariable Long id,
            @Valid @RequestBody CreateExpenseRequestDto updateDto) {
        try {
            ExpenseRequestResponseDto responseDto = expenseService.updatePendingExpense(id, updateDto);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expense not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().equals("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access denied"));
            } else if (e.getMessage().equals("Only pending or rejected expenses can be updated")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Only pending or rejected expenses can be updated"));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error updating expense: " + e.getMessage()));
            }
        }
    }

    /**
     * Delete a pending expense
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePendingExpense(@PathVariable Long id) {
        try {
            expenseService.deletePendingExpense(id);
            return ResponseEntity.ok(new MessageResponse("Expense deleted successfully"));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expense not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().equals("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access denied"));
            } else if (e.getMessage().equals("Only pending or rejected expenses can be deleted")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Only pending or rejected expenses can be deleted"));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error deleting expense: " + e.getMessage()));
            }
        }
    }

    // ============= MANAGER ENDPOINTS =============
    /**
     * Get all pending expenses awaiting manager approval
     */
    @GetMapping("/pending-manager-approval")
    public ResponseEntity<?> getPendingExpensesForManagerApproval() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getPendingExpensesForManagerApproval();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error retrieving pending expenses: " + e.getMessage()));
            }
        }
    }

    /**
     * Get all expenses approved by manager (for approved tab) Includes expenses
     * with PENDING_FINANCE and PAID statuses
     */
    @GetMapping("/approved-by-manager")
    public ResponseEntity<?> getExpensesApprovedByManager() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getExpensesApprovedByManager();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error retrieving approved expenses: " + e.getMessage()));
            }
        }
    }

    /**
     * Get all expenses processed by manager (for history tab) Includes
     * approved, rejected, and paid expenses
     */
    @GetMapping("/manager-history")
    public ResponseEntity<?> getExpensesProcessedByManager() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getExpensesProcessedByManager();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error retrieving expense history: " + e.getMessage()));
            }
        }
    }

    /**
     * Approve a pending expense (Manager action) Changes status from
     * PENDING_MANAGER to PENDING_FINANCE
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveExpense(@PathVariable Long id,
            @Valid @RequestBody ManagerActionRequestDto actionRequest) {
        try {
            ExpenseRequestResponseDto responseDto = expenseService.approveExpense(id, actionRequest);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expense not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else if (e.getMessage().contains("Only expenses with PENDING_MANAGER status")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error approving expense: " + e.getMessage()));
            }
        }
    }

    /**
     * Reject a pending expense (Manager action) Changes status from
     * PENDING_MANAGER to REJECTED_MANAGER
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectExpense(@PathVariable Long id,
            @Valid @RequestBody ManagerActionRequestDto actionRequest) {
        try {
            ExpenseRequestResponseDto responseDto = expenseService.rejectExpense(id, actionRequest);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expense not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else if (e.getMessage().contains("Only expenses with PENDING_MANAGER status")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error rejecting expense: " + e.getMessage()));
            }
        }
    }

    // ============= FINANCE ENDPOINTS =============
    /**
     * Get all pending expenses awaiting finance approval
     */
    @GetMapping("/pending-finance-approval")
    public ResponseEntity<?> getPendingExpensesForFinanceApproval() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getPendingExpensesForFinanceApproval();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error retrieving pending expenses: " + e.getMessage()));
            }
        }
    }

    /**
     * Get all expenses approved by finance (for approved tab) Includes expenses
     * with PAID status
     */
    @GetMapping("/approved-by-finance")
    public ResponseEntity<?> getExpensesApprovedByFinance() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getExpensesApprovedByFinance();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error retrieving approved expenses: " + e.getMessage()));
            }
        }
    }

    /**
     * Get all expenses processed by finance (for history tab) Includes approved
     * and rejected expenses
     */
    @GetMapping("/finance-history")
    public ResponseEntity<?> getExpensesProcessedByFinance() {
        try {
            List<ExpenseRequestResponseDto> expenses = expenseService.getExpensesProcessedByFinance();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error retrieving expense history: " + e.getMessage()));
            }
        }
    }

    /**
     * Approve a pending expense with payout details (Finance action) Changes
     * status from PENDING_FINANCE to PAID
     */
    @PostMapping("/{id}/finance-approve")
    public ResponseEntity<?> approveExpenseByFinance(@PathVariable Long id,
            @Valid @RequestBody FinanceActionRequestDto actionRequest) {
        try {
            ExpenseRequestResponseDto responseDto = expenseService.approveExpenseByFinance(id, actionRequest);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expense not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else if (e.getMessage().contains("Only expenses with PENDING_FINANCE status")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error approving expense: " + e.getMessage()));
            }
        }
    }

    /**
     * Reject a pending expense (Finance action) Changes status from
     * PENDING_FINANCE to REJECTED_FINANCE
     */
    @PostMapping("/{id}/finance-reject")
    public ResponseEntity<?> rejectExpenseByFinance(@PathVariable Long id,
            @Valid @RequestBody FinanceRejectionRequestDto rejectionRequest) {
        try {
            ExpenseRequestResponseDto responseDto = expenseService.rejectExpenseByFinance(id, rejectionRequest);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expense not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(e.getMessage()));
            } else if (e.getMessage().contains("Only expenses with PENDING_FINANCE status")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse(e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error rejecting expense: " + e.getMessage()));
            }
        }
    }
}
