package com.backend.cs203.exception;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.backend.cs203.dto.error.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Container class for all exception-related classes
 */
public class Exceptions {

    /**
     * Custom exception for authentication errors
     */
    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }

    /**
     * Global exception handler
     */
    @RestControllerAdvice
    public static class GlobalExceptionHandler {

        private static final Logger log =
                LoggerFactory.getLogger(GlobalExceptionHandler.class);

        /**
         * Handle authentication / authorization errors
         * Returns 401 Unauthorized
         */
        @ExceptionHandler(AuthException.class)
        public ResponseEntity<ErrorResponse> handleAuthException(
                AuthException ex,
                HttpServletRequest req) {

            log.warn("Auth error: {}", ex.getMessage());

            ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(ex.getMessage())
                .path(req.getRequestURI())
                .build();

            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(body);
        }

        /**
         * Handle @Valid validation errors
         * Returns 400 Bad Request
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationErrors(
                MethodArgumentNotValidException ex,
                HttpServletRequest req) {

            String message = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .map(error -> {
                    if (error instanceof FieldError fe) {
                        return fe.getField() + ": " + fe.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .reduce((a, b) -> a + ", " + b)
                .orElse("Validation failed");

            log.warn("Validation error: {}", message);

            ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now()) 
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(req.getRequestURI())
                .build();

            return ResponseEntity
                .badRequest()
                .body(body);
        }

        /**
         * Catch-all handler for unexpected errors
         * Returns 500 Internal Server Error
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleUnexpectedError(
                Exception ex,
                HttpServletRequest req) {

            log.error("Unhandled exception at {}", req.getRequestURI(), ex);

            ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred")
                .path(req.getRequestURI())
                .build();

            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body);
        }
    }
}