package com.college.library.exception;

public class DuplicateStudentIdException extends RuntimeException {

    public DuplicateStudentIdException(String studentId) {
        super("A student with ID " + studentId + " already exists");
    }
}
