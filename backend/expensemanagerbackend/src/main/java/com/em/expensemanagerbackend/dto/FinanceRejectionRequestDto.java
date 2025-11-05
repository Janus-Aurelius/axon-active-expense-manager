package com.em.expensemanagerbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FinanceRejectionRequestDto {

    @NotBlank(message = "Comment is required for finance rejection")
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String comment;

    // Constructors
    public FinanceRejectionRequestDto() {
    }

    public FinanceRejectionRequestDto(String comment) {
        this.comment = comment;
    }

    // Getters and Setters
    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
