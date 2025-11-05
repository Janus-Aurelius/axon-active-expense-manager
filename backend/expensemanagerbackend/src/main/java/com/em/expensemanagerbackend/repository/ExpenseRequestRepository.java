package com.em.expensemanagerbackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.em.expensemanagerbackend.enums.ExpenseStatus;
import com.em.expensemanagerbackend.model.ExpenseRequest;

@Repository
public interface ExpenseRequestRepository extends JpaRepository<ExpenseRequest, Long> {

    // Find all expenses for a specific employee
    List<ExpenseRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    // Find expenses by employee and status
    List<ExpenseRequest> findByEmployeeIdAndStatusOrderByCreatedAtDesc(Long employeeId, ExpenseStatus status);

    // Find draft expenses for a specific employee (using PENDING_MANAGER as draft)
    @Query("SELECT e FROM ExpenseRequest e WHERE e.employee.id = :employeeId AND e.status = :status ORDER BY e.createdAt DESC")
    List<ExpenseRequest> findDraftExpensesByEmployeeId(@Param("employeeId") Long employeeId, @Param("status") ExpenseStatus status);

    // Find expenses by status
    List<ExpenseRequest> findByStatusOrderByCreatedAtDesc(ExpenseStatus status);

    // Count expenses by status for an employee
    @Query("SELECT COUNT(e) FROM ExpenseRequest e WHERE e.employee.id = :employeeId AND e.status = :status")
    Long countByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, @Param("status") ExpenseStatus status);

    // Find all pending expenses that need manager approval
    List<ExpenseRequest> findByStatusOrderByCreatedAtAsc(ExpenseStatus status);

    // Find pending expenses for manager review (all PENDING_MANAGER status)
    @Query("SELECT e FROM ExpenseRequest e WHERE e.status = :status ORDER BY e.createdAt ASC")
    List<ExpenseRequest> findPendingManagerApproval(@Param("status") ExpenseStatus status);

    // Find pending expenses for finance review (all PENDING_FINANCE status)
    @Query("SELECT e FROM ExpenseRequest e WHERE e.status = :status ORDER BY e.createdAt ASC")
    List<ExpenseRequest> findPendingFinanceApproval(@Param("status") ExpenseStatus status);
}
