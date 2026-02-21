package com.backend.cs203.service;

import java.time.Instant;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.cs203.dto.auth.AuthResponse;
import com.backend.cs203.dto.auth.LoginRequest;
import com.backend.cs203.dto.auth.UserInfoResponse;
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

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("Invalid username or password. Please try again"));

        if (user.getDeactivatedAt() != null) {
            throw new AuthException("Account has been deactivated. Please contact the support team");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Invalid username or password. Please try again");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .usertype(user.getUsertype().name())
                .build();
    }

    public UserInfoResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found. Refresh and try again"));

        return UserInfoResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .usertype(user.getUsertype().name())
                .build();
    }
}
