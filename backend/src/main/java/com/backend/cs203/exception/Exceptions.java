package com.backend.cs203.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.backend.cs203.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;

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
        public ResponseEntity<ErrorResponse> handleAuthException(AuthException ex, HttpServletRequest req) {
            ErrorResponse body = ErrorResponse.builder()
                .timestamp(java.time.Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(ex.getMessage())
                .path(req.getRequestURI())
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        /**
         * Handle validation errors from @Valid annotations
         * Returns 400 Bad Request with field-specific errors
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest req) {
            String msg = ex.getBindingResult().getAllErrors().stream()
                    .map(error -> {
                        String field = ((FieldError) error).getField();
                        String message = error.getDefaultMessage();
                        return field + ": " + message;
                    })
                    .reduce((a, b) -> a + ", " + b)
                    .orElse(ex.getMessage());

                ErrorResponse body = ErrorResponse.builder()
                    .timestamp(java.time.Instant.now())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                    .message(msg)
                    .path(req.getRequestURI())
                    .build();
                return ResponseEntity.badRequest().body(body);
        }

        /**
         * Catch-all for unexpected errors
         * Returns 500 Internal Server Error
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleUnexpectedError(Exception ex, HttpServletRequest req) {
            ErrorResponse body = ErrorResponse.builder()
                .timestamp(java.time.Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred")
                .path(req.getRequestURI())
                .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }
}
