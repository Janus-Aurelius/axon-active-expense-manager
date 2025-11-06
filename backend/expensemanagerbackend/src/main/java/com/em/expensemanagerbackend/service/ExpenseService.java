package com.em.expensemanagerbackend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.em.expensemanagerbackend.dto.CreateExpenseRequestDto;
import com.em.expensemanagerbackend.dto.ExpenseRequestResponseDto;
import com.em.expensemanagerbackend.dto.FinanceActionRequestDto;
import com.em.expensemanagerbackend.dto.FinanceRejectionRequestDto;
import com.em.expensemanagerbackend.dto.ManagerActionRequestDto;
import com.em.expensemanagerbackend.enums.ExpenseStatus;
import com.em.expensemanagerbackend.enums.FinanceActionType;
import com.em.expensemanagerbackend.enums.ManagerActionType;
import com.em.expensemanagerbackend.enums.UserRole;
import com.em.expensemanagerbackend.model.ExpenseRequest;
import com.em.expensemanagerbackend.model.FinanceAction;
import com.em.expensemanagerbackend.model.ManagerAction;
import com.em.expensemanagerbackend.model.User;
import com.em.expensemanagerbackend.repository.ExpenseRequestRepository;
import com.em.expensemanagerbackend.repository.UserRepository;

@Service
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseRequestRepository expenseRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create a new expense request (starts as PENDING_MANAGER)
     */
    public ExpenseRequestResponseDto createExpenseRequest(CreateExpenseRequestDto createDto) {
        // Get current authenticated user
        User currentUser = getCurrentUser();

        // Create new expense request
        ExpenseRequest expense = new ExpenseRequest();
        expense.setTitle(createDto.getTitle());
        expense.setDescription(createDto.getDescription());
        expense.setAmount(createDto.getAmount());
        expense.setReceiptUrl(createDto.getReceiptUrl());
        expense.setStatus(ExpenseStatus.PENDING_MANAGER);
        expense.setEmployee(currentUser);

        // Save the expense
        ExpenseRequest savedExpense = expenseRequestRepository.save(expense);

        // Notify managers of new expense submission
        notificationService.notifyManagersOfNewExpense(savedExpense);

        // Convert to response DTO
        ExpenseRequestResponseDto responseDto = convertToResponseDto(savedExpense);
        return responseDto;
    }

    /**
     * Get all expenses for the current user
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getCurrentUserExpenses() {
        User currentUser = getCurrentUser();
        List<ExpenseRequest> expenses = expenseRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(currentUser.getId());
        return expenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get pending expenses for the current user
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getCurrentUserPendingExpenses() {
        User currentUser = getCurrentUser();
        List<ExpenseRequest> expenses = expenseRequestRepository.findByEmployeeIdAndStatusOrderByCreatedAtDesc(
                currentUser.getId(), ExpenseStatus.PENDING_MANAGER);
        return expenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get rejected expenses for the current user
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getCurrentUserRejectedExpenses() {
        User currentUser = getCurrentUser();
        List<ExpenseRequest> rejectedExpenses = expenseRequestRepository.findByEmployeeIdAndStatusOrderByCreatedAtDesc(
                currentUser.getId(), ExpenseStatus.REJECTED_MANAGER);
        List<ExpenseRequest> financeRejectedExpenses = expenseRequestRepository.findByEmployeeIdAndStatusOrderByCreatedAtDesc(
                currentUser.getId(), ExpenseStatus.REJECTED_FINANCE);

        // Combine both lists
        rejectedExpenses.addAll(financeRejectedExpenses);

        return rejectedExpenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get expense by ID (with role-based access control)
     */
    @Transactional(readOnly = true)
    public ExpenseRequestResponseDto getExpenseById(Long expenseId) {
        User currentUser = getCurrentUser();
        ExpenseRequest expense = expenseRequestRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Role-based access control
        if (currentUser.getRole() == UserRole.EMPLOYEE) {
            // Employees can only view their own expenses
            if (!expense.getEmployee().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Access denied");
            }
        } else if (currentUser.getRole() == UserRole.MANAGER) {
            // Managers can view any expense (for approval/review purposes)
            // No additional restriction needed
        } else if (currentUser.getRole() == UserRole.FINANCE) {
            // Finance can view any expense (for payment processing)
            // No additional restriction needed
        } else {
            // Unknown role, deny access
            throw new RuntimeException("Access denied");
        }

        return convertToResponseDto(expense);
    }

    /**
     * Update a pending expense (only if not yet processed by manager)
     */
    public ExpenseRequestResponseDto updatePendingExpense(Long expenseId, CreateExpenseRequestDto updateDto) {
        User currentUser = getCurrentUser();
        ExpenseRequest expense = expenseRequestRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Check if the expense belongs to the current user
        if (!expense.getEmployee().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Check if the expense can be updated
        // Allow updates for PENDING_MANAGER, REJECTED_MANAGER, and REJECTED_FINANCE statuses
        if (expense.getStatus() != ExpenseStatus.PENDING_MANAGER
                && expense.getStatus() != ExpenseStatus.REJECTED_MANAGER
                && expense.getStatus() != ExpenseStatus.REJECTED_FINANCE) {
            throw new RuntimeException("Only pending or rejected expenses can be updated");
        }

        // Update the expense
        expense.setTitle(updateDto.getTitle());
        expense.setDescription(updateDto.getDescription());
        expense.setAmount(updateDto.getAmount());
        expense.setReceiptUrl(updateDto.getReceiptUrl());

        // If the expense was rejected, return it to PENDING_MANAGER status when edited
        // This preserves the full history while allowing the expense to be reconsidered
        if (expense.getStatus() == ExpenseStatus.REJECTED_MANAGER
                || expense.getStatus() == ExpenseStatus.REJECTED_FINANCE) {
            expense.setStatus(ExpenseStatus.PENDING_MANAGER);
        }

        ExpenseRequest savedExpense = expenseRequestRepository.save(expense);
        return convertToResponseDto(savedExpense);
    }

    /**
     * Delete a pending expense (only if not yet processed by manager)
     */
    public void deletePendingExpense(Long expenseId) {
        User currentUser = getCurrentUser();
        ExpenseRequest expense = expenseRequestRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Check if the expense belongs to the current user
        if (!expense.getEmployee().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Check if the expense can be deleted
        // Allow deletion for PENDING_MANAGER, REJECTED_MANAGER, and REJECTED_FINANCE statuses
        if (expense.getStatus() != ExpenseStatus.PENDING_MANAGER
                && expense.getStatus() != ExpenseStatus.REJECTED_MANAGER
                && expense.getStatus() != ExpenseStatus.REJECTED_FINANCE) {
            throw new RuntimeException("Only pending or rejected expenses can be deleted");
        }

        expenseRequestRepository.delete(expense);
    }

    // ============= MANAGER OPERATIONS =============
    /**
     * Get all pending expenses awaiting manager approval
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getPendingExpensesForManagerApproval() {
        User currentUser = getCurrentUser();

        // Verify the current user is a manager
        if (currentUser.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Access denied: Only managers can view pending approvals");
        }

        List<ExpenseRequest> pendingExpenses = expenseRequestRepository.findPendingManagerApproval(ExpenseStatus.PENDING_MANAGER);
        return pendingExpenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all expenses approved by manager (for approved tab) Includes expenses
     * with PENDING_FINANCE and PAID statuses
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getExpensesApprovedByManager() {
        User currentUser = getCurrentUser();

        // Verify the current user is a manager
        if (currentUser.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Access denied: Only managers can view approved expenses");
        }

        List<ExpenseStatus> approvedStatuses = List.of(ExpenseStatus.PENDING_FINANCE, ExpenseStatus.PAID);
        List<ExpenseRequest> approvedExpenses = expenseRequestRepository.findExpensesApprovedByManager(approvedStatuses);
        return approvedExpenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all expenses processed by manager (for history tab) Includes
     * approved, pending finance, rejected, and paid expenses
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getExpensesProcessedByManager() {
        User currentUser = getCurrentUser();

        // Verify the current user is a manager
        if (currentUser.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Access denied: Only managers can view expense history");
        }

        List<ExpenseStatus> processedStatuses = List.of(
                ExpenseStatus.PENDING_FINANCE, // Approved by manager
                ExpenseStatus.REJECTED_MANAGER, // Rejected by manager
                ExpenseStatus.REJECTED_FINANCE, // Rejected by finance (but was approved by manager)
                ExpenseStatus.PAID // Fully approved and paid
        );
        List<ExpenseRequest> processedExpenses = expenseRequestRepository.findExpensesProcessedByManager(processedStatuses);
        return processedExpenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Approve a pending expense request (Manager action) Changes status from
     * PENDING_MANAGER to PENDING_FINANCE
     */
    public ExpenseRequestResponseDto approveExpense(Long expenseId, ManagerActionRequestDto actionRequest) {
        User currentManager = getCurrentUser();

        // Verify the current user is a manager
        if (currentManager.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Access denied: Only managers can approve expenses");
        }

        // Find the expense request
        ExpenseRequest expense = expenseRequestRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify the expense is in PENDING_MANAGER status
        if (expense.getStatus() != ExpenseStatus.PENDING_MANAGER) {
            throw new RuntimeException("Only expenses with PENDING_MANAGER status can be approved");
        }

        // Change status to PENDING_FINANCE (moves to finance for final decision)  
        expense.setStatus(ExpenseStatus.PENDING_FINANCE);

        // Create manager action record
        ManagerAction managerAction = new ManagerAction(
                ManagerActionType.APPROVED,
                actionRequest.getComment(),
                expense,
                currentManager
        );

        // Add the action to the expense (this will set the bidirectional relationship)
        expense.addManagerAction(managerAction);

        // Save the expense (this will cascade save the manager action)
        ExpenseRequest savedExpense = expenseRequestRepository.save(expense);

        // Notify employee and finance team of manager approval
        notificationService.notifyExpenseApprovedByManager(savedExpense, currentManager);

        // Broadcast real-time update via SSE
        ExpenseRequestResponseDto responseDto = convertToResponseDto(savedExpense);


        return responseDto;
    }

    /**
     * Reject a pending expense request (Manager action) Changes status from
     * PENDING_MANAGER to REJECTED_MANAGER
     */
    public ExpenseRequestResponseDto rejectExpense(Long expenseId, ManagerActionRequestDto actionRequest) {
        User currentManager = getCurrentUser();

        // Verify the current user is a manager
        if (currentManager.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Access denied: Only managers can reject expenses");
        }

        // Find the expense request
        ExpenseRequest expense = expenseRequestRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify the expense is in PENDING_MANAGER status
        if (expense.getStatus() != ExpenseStatus.PENDING_MANAGER) {
            throw new RuntimeException("Only expenses with PENDING_MANAGER status can be rejected");
        }

        // Change status to REJECTED_MANAGER
        expense.setStatus(ExpenseStatus.REJECTED_MANAGER);

        // Create manager action record
        ManagerAction managerAction = new ManagerAction(
                ManagerActionType.REJECTED,
                actionRequest.getComment(),
                expense,
                currentManager
        );

        // Add the action to the expense
        expense.addManagerAction(managerAction);

        // Save the expense
        ExpenseRequest savedExpense = expenseRequestRepository.save(expense);

        // Notify employee of manager rejection
        notificationService.notifyExpenseRejectedByManager(savedExpense, currentManager, actionRequest.getComment());

        // Broadcast real-time update via SSE
        ExpenseRequestResponseDto responseDto = convertToResponseDto(savedExpense);


        return responseDto;
    }

    // ============= FINANCE OPERATIONS =============
    /**
     * Get all pending expenses awaiting finance approval
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getPendingExpensesForFinanceApproval() {
        User currentUser = getCurrentUser();

        // Verify the current user is finance staff
        if (currentUser.getRole() != UserRole.FINANCE) {
            throw new RuntimeException("Access denied: Only finance staff can view pending finance approvals");
        }

        List<ExpenseRequest> pendingExpenses = expenseRequestRepository.findPendingFinanceApproval(ExpenseStatus.PENDING_FINANCE);
        return pendingExpenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all expenses approved by finance (for approved tab) Includes expenses
     * with PAID status
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getExpensesApprovedByFinance() {
        User currentUser = getCurrentUser();

        // Verify the current user is finance staff
        if (currentUser.getRole() != UserRole.FINANCE) {
            throw new RuntimeException("Access denied: Only finance staff can view approved expenses");
        }

        List<ExpenseRequest> approvedExpenses = expenseRequestRepository.findExpensesApprovedByFinance(ExpenseStatus.PAID);
        return approvedExpenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all expenses processed by finance (for history tab) Includes approved
     * (paid) and rejected by finance expenses
     */
    @Transactional(readOnly = true)
    public List<ExpenseRequestResponseDto> getExpensesProcessedByFinance() {
        User currentUser = getCurrentUser();

        // Verify the current user is finance staff
        if (currentUser.getRole() != UserRole.FINANCE) {
            throw new RuntimeException("Access denied: Only finance staff can view expense history");
        }

        List<ExpenseStatus> processedStatuses = List.of(
                ExpenseStatus.PAID, // Approved by finance
                ExpenseStatus.REJECTED_FINANCE // Rejected by finance
        );
        List<ExpenseRequest> processedExpenses = expenseRequestRepository.findExpensesProcessedByFinance(processedStatuses);
        return processedExpenses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Approve a pending expense request (Finance action) Changes status from
     * PENDING_FINANCE to PAID Sets payout details including reimbursement
     * method and expected payout date
     */
    public ExpenseRequestResponseDto approveExpenseByFinance(Long expenseId, FinanceActionRequestDto actionRequest) {
        User currentFinanceUser = getCurrentUser();

        // Verify the current user is finance staff
        if (currentFinanceUser.getRole() != UserRole.FINANCE) {
            throw new RuntimeException("Access denied: Only finance staff can approve expenses");
        }

        // Find the expense request
        ExpenseRequest expense = expenseRequestRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify the expense is in PENDING_FINANCE status
        if (expense.getStatus() != ExpenseStatus.PENDING_FINANCE) {
            throw new RuntimeException("Only expenses with PENDING_FINANCE status can be approved by finance");
        }

        // Change status to PAID (final approved state)
        expense.setStatus(ExpenseStatus.PAID);

        // Create finance action record with payout details
        String paymentReference = buildPaymentReference(actionRequest);
        FinanceAction financeAction = new FinanceAction(
                FinanceActionType.APPROVED,
                paymentReference,
                actionRequest.getNote(),
                expense,
                currentFinanceUser
        );

        // Add the action to the expense (this will set the bidirectional relationship)
        expense.addFinanceAction(financeAction);

        // Save the expense (this will cascade save the finance action)
        ExpenseRequest savedExpense = expenseRequestRepository.save(expense);

        // Notify employee of finance approval
        notificationService.notifyExpenseApprovedByFinance(savedExpense, currentFinanceUser);

        // Broadcast real-time update via SSE
        ExpenseRequestResponseDto responseDto = convertToResponseDto(savedExpense);


        return responseDto;
    }

    /**
     * Reject a pending expense request (Finance action) Changes status from
     * PENDING_FINANCE to REJECTED_FINANCE Requires a comment/reason for
     * rejection
     */
    public ExpenseRequestResponseDto rejectExpenseByFinance(Long expenseId, FinanceRejectionRequestDto rejectionRequest) {
        User currentFinanceUser = getCurrentUser();

        // Verify the current user is finance staff
        if (currentFinanceUser.getRole() != UserRole.FINANCE) {
            throw new RuntimeException("Access denied: Only finance staff can reject expenses");
        }

        // Find the expense request
        ExpenseRequest expense = expenseRequestRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify the expense is in PENDING_FINANCE status
        if (expense.getStatus() != ExpenseStatus.PENDING_FINANCE) {
            throw new RuntimeException("Only expenses with PENDING_FINANCE status can be rejected by finance");
        }

        // Change status to REJECTED_FINANCE
        expense.setStatus(ExpenseStatus.REJECTED_FINANCE);

        // Create finance action record with required comment
        FinanceAction financeAction = new FinanceAction(
                FinanceActionType.REJECTED,
                null, // No payment reference for rejection
                rejectionRequest.getComment(), // Required comment for rejection
                expense,
                currentFinanceUser
        );

        // Add the action to the expense
        expense.addFinanceAction(financeAction);

        // Save the expense
        ExpenseRequest savedExpense = expenseRequestRepository.save(expense);

        // Notify employee of finance rejection
        notificationService.notifyExpenseRejectedByFinance(savedExpense, currentFinanceUser, rejectionRequest.getComment());

        // Broadcast real-time update via SSE
        ExpenseRequestResponseDto responseDto = convertToResponseDto(savedExpense);


        return responseDto;
    }

    /**
     * Build payment reference string from finance action request Includes
     * reimbursement method and expected payout date
     */
    private String buildPaymentReference(FinanceActionRequestDto actionRequest) {
        StringBuilder paymentRef = new StringBuilder();

        if (actionRequest.getReimbursementMethod() != null && !actionRequest.getReimbursementMethod().trim().isEmpty()) {
            paymentRef.append("Method: ").append(actionRequest.getReimbursementMethod());
        }

        if (actionRequest.getExpectedPayoutDate() != null) {
            if (paymentRef.length() > 0) {
                paymentRef.append(" | ");
            }
            paymentRef.append("Expected Payout: ").append(actionRequest.getExpectedPayoutDate());
        }

        return paymentRef.length() > 0 ? paymentRef.toString() : null;
    }

    /**
     * Convert ExpenseRequest entity to response DTO
     */
    private ExpenseRequestResponseDto convertToResponseDto(ExpenseRequest expense) {
        return new ExpenseRequestResponseDto(
                expense.getId(),
                expense.getTitle(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getReceiptUrl(),
                expense.getStatus(),
                expense.getCreatedAt(),
                expense.getUpdatedAt(),
                expense.getEmployee().getFullName(),
                expense.getEmployee().getEmail()
        );
    }

    /**
     * Get current authenticated user For development mode: returns a user based
     * on X-Dev-User-Role header or default
     */
    private User getCurrentUser() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof User) {
                return (User) principal;
            }
        } catch (Exception e) {
            // Authentication context not available, use development mode
        }

        // DEVELOPMENT MODE: Check for role header to determine which user to return
        return getDevModeUser();
    }

    /**
     * Development mode user selection based on role
     */
    private User getDevModeUser() {
        // Try to get current HTTP request to check for role header
        try {
            org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes();
            jakarta.servlet.http.HttpServletRequest request
                    = ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest();

            String devRole = request.getHeader("X-Dev-User-Role");
            String devUserId = request.getHeader("X-Dev-User-Id");

            // If specific user ID is provided
            if (devUserId != null) {
                try {
                    Long userId = Long.parseLong(devUserId);
                    return userRepository.findById(userId).orElseThrow(()
                            -> new RuntimeException("Development user with ID " + userId + " not found"));
                } catch (NumberFormatException e) {
                    // Invalid user ID, fall through to role-based selection
                }
            }

            // Role-based user selection
            if ("EMPLOYEE".equalsIgnoreCase(devRole)) {
                return userRepository.findById(1L).orElseThrow(()
                        -> new RuntimeException("Default employee user not found")); // John Smith
            } else if ("MANAGER".equalsIgnoreCase(devRole)) {
                return userRepository.findById(5L).orElseThrow(()
                        -> new RuntimeException("Default manager user not found")); // Robert Taylor
            } else if ("FINANCE".equalsIgnoreCase(devRole)) {
                return userRepository.findById(7L).orElseThrow(()
                        -> new RuntimeException("Default finance user not found")); // David Brown
            }
        } catch (Exception e) {
            // No request context available, use default
        }

        // Default to manager user for testing manager endpoints
        return userRepository.findById(5L).orElseThrow(()
                -> new RuntimeException("Default development user not found"));
    }
}
