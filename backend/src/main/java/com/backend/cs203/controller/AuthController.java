package com.backend.cs203.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.auth.AuthResponse;
import com.backend.cs203.dto.auth.ForgotPasswordRequest;
import com.backend.cs203.dto.auth.LoginRequest;
import com.backend.cs203.dto.auth.RegisterRequest;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.dto.auth.ResetPasswordRequest;
import com.backend.cs203.dto.auth.UserInfoResponse;
import com.backend.cs203.dto.auth.VerifyOtpRequest;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.security.CookieFactory;
import com.backend.cs203.service.AuthService;
import com.backend.cs203.service.PasswordResetService;
import com.backend.cs203.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieFactory cookieFactory;
    private final UserService userService;
    private final PasswordResetService passwordResetService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @PostMapping("/login")
    public ResponseEntity<UserInfoResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);

        // Create HttpOnly cookie with JWT (convert ms to seconds for maxAge)
        long maxAgeSeconds = Math.max(1, jwtExpirationMs / 1000);
        ResponseCookie cookie = cookieFactory.jwtCookie(auth.getToken(), maxAgeSeconds);

        // Return user info only (token is in HttpOnly cookie)
        UserInfoResponse userInfo = UserInfoResponse.builder()
                .username(auth.getUsername())
                .email(auth.getEmail())
                .usertype(auth.getUsertype())
                .profilePictureUrl(auth.getProfilePictureUrl())
                .build();

        return cookieFactory.withCookie(cookie, userInfo);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> registerUser(
        @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = userService.registerUser(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = cookieFactory.clearJwtCookie();
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .build();
    }
        
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthException("Unauthorized Access. Refresh and try again");
        }

        String username = authentication.getName();
        UserInfoResponse resp = authService.getCurrentUser(username);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest body) {
        try {
            passwordResetService.sendOtp(body.getEmail());
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest body) {
        try {
            passwordResetService.verifyOtp(body.getEmail(), body.getOtp());
            return ResponseEntity.ok(Map.of("message", "OTP verified"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest body) {
        try {
            passwordResetService.resetPassword(
                body.getEmail(),
                body.getOtp(),
                body.getPassword()
            );
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
