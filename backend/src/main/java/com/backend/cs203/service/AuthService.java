package com.backend.cs203.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.cs203.dto.AuthResponse;
import com.backend.cs203.dto.LoginRequest;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("Invalid username or password"));

        // Check if account is deactivated (soft delete shit)
        if (user.getDeactivatedAt() != null) {
            throw new AuthException("Account is deactivated");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Invalid username or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .usertype(user.getUsertype().name())
                .build();
    }
}
