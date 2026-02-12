package com.backend.cs203.service;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.dto.auth.RegisterRequest;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // -----------------------
    // Register
    // -----------------------
    @Transactional
    public RegisterResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new RegisterResponse(false, "Username already exists", null);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return new RegisterResponse(false, "Email already exists", null);
        }

        User.UserType userType;
        try {
            userType = User.UserType.valueOf(request.getUsertype());
        } catch (IllegalArgumentException e) {
            return new RegisterResponse(false, "Invalid user type", null);
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .usertype(userType)
            .streak(0)
            .createdAt(Instant.now())
            .build();

        User savedUser = userRepository.save(user);

        RegisterResponse.UserData userData = new RegisterResponse.UserData(savedUser);
        return new RegisterResponse(true, "User registered successfully", userData);
    }

    // -----------------------
    // Profile (GET /api/profile)
    // -----------------------
    public UserResponse getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String username = auth.getName();

        User user = userRepository.findById(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new UserResponse(user.getUsername(), user.getProfilePictureUrl());
    }
}
