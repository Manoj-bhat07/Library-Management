package com.college.library.exception;

/**
 * Thrown when a requested book does not exist. Handled as HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
