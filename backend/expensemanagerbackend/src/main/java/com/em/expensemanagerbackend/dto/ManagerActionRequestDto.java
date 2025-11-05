package com.em.expensemanagerbackend.dto;

import jakarta.validation.constraints.Size;

public class ManagerActionRequestDto {

    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String comment;

    // Constructors
    public ManagerActionRequestDto() {
    }

    public ManagerActionRequestDto(String comment) {
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
