package com.backend.cs203.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.AuthResponse;
import com.backend.cs203.dto.LoginRequest;
import com.backend.cs203.dto.UserInfoResponse;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @PostMapping("/login")
    public ResponseEntity<UserInfoResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);

        // Create HttpOnly cookie with JWT (convert ms to seconds for maxAge)
        long maxAgeSeconds = Math.max(1, jwtExpirationMs / 1000);
        ResponseCookie cookie = ResponseCookie.from("jwt", auth.getToken())
                .httpOnly(true)
                .secure(false)  // set true in production with HTTPS
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();

        // Return user info only (token is in HttpOnly cookie)
        UserInfoResponse userInfo = UserInfoResponse.builder()
                .username(auth.getUsername())
                .email(auth.getEmail())
                .usertype(auth.getUsertype())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(userInfo);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(java.util.Map.of(
                "username", authentication.getName(),
                "roles", authentication.getAuthorities()
        ));
    }
}
