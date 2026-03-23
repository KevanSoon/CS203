package com.backend.cs203.dto.auth;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}