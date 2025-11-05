package com.em.expensemanagerbackend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public class FinanceActionRequestDto {

    @Size(max = 1000, message = "Note cannot exceed 1000 characters")
    private String note;

    @Size(max = 200, message = "Reimbursement method cannot exceed 200 characters")
    private String reimbursementMethod;

    private LocalDate expectedPayoutDate;

    // Constructors
    public FinanceActionRequestDto() {
    }

    public FinanceActionRequestDto(String note, String reimbursementMethod, LocalDate expectedPayoutDate) {
        this.note = note;
        this.reimbursementMethod = reimbursementMethod;
        this.expectedPayoutDate = expectedPayoutDate;
    }

    // Getters and Setters
    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getReimbursementMethod() {
        return reimbursementMethod;
    }

    public void setReimbursementMethod(String reimbursementMethod) {
        this.reimbursementMethod = reimbursementMethod;
    }

    public LocalDate getExpectedPayoutDate() {
        return expectedPayoutDate;
    }

    public void setExpectedPayoutDate(LocalDate expectedPayoutDate) {
        this.expectedPayoutDate = expectedPayoutDate;
    }
}
