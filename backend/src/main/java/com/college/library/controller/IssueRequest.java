package com.college.library.controller;

import jakarta.validation.constraints.NotNull;

public record IssueRequest(
        @NotNull(message = "Book is required") Long bookId,
        @NotNull(message = "Student is required") Long studentId
) {
}
