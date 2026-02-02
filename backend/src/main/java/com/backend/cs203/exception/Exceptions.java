package com.backend.cs203.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Container class for all exception-related classes
 */
public class Exceptions {

    /**
     * Custom exception for authentication errors
     * Thrown when login fails, account is deactivated, etc.
     */
    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }

    /**
     * Global exception handler for all controllers
     * Converts exceptions into proper HTTP responses
     */
    @RestControllerAdvice
    public static class GlobalExceptionHandler {

        /**
         * Handle authentication errors (invalid credentials, duplicate users, etc.)
         * Returns 401 Unauthorized
         */
        @ExceptionHandler(AuthException.class)
        public ResponseEntity<Map<String, String>> handleAuthException(AuthException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", ex.getMessage()));
        }

        /**
         * Handle validation errors from @Valid annotations
         * Returns 400 Bad Request with field-specific errors
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
            Map<String, String> errors = new HashMap<>();
            ex.getBindingResult().getFieldErrors().forEach(error -> {
                String field = error.getField();
                String message = error.getDefaultMessage();
                errors.put(field, message);
            });
            return ResponseEntity.badRequest().body(errors);
        }

        /**
         * Catch-all for unexpected errors
         * Returns 500 Internal Server Error
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, String>> handleUnexpectedError(Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }
}
