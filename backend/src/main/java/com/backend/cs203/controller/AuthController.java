package com.backend.cs203.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.AuthResponse;
import com.backend.cs203.dto.LoginRequest;
import com.backend.cs203.dto.UserInfoResponse;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.security.CookieFactory;
import com.backend.cs203.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieFactory cookieFactory;

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
                .build();

        return cookieFactory.withCookie(cookie, userInfo);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = cookieFactory.clearJwtCookie();
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .build();
    }
        
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthException("Unauthorized");
        }

        return ResponseEntity.ok(java.util.Map.of(
                "username", authentication.getName(),
                "roles", authentication.getAuthorities()
        ));
    }

}
