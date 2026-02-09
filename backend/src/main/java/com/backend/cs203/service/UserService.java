package com.backend.cs203.service;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.auth.RegisterRequest;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public RegisterResponse registerUser(RegisterRequest request) {
        // if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new RegisterResponse(false, "Username already exists", null);
        }
        // if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new RegisterResponse(false, "Email already exists", null);
        }

        User.UserType userType;
        try{
            userType = User.UserType.valueOf(request.getUsertype());
        } catch (IllegalArgumentException e) {
            return new RegisterResponse(false, "Invalid user type", null);
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .usertype(userType)
            .streak(0)  // New users start with 0 streak
            .createdAt(Instant.now())  // Set creation time
            // lastLogin is null (user hasn't logged in yet)
            // deactivatedAt is null (account is active)
            .build();

        User savedUser = userRepository.save(user);

        RegisterResponse.UserData userData = new RegisterResponse.UserData(savedUser);
        
        return new RegisterResponse(true, "User registered successfully", userData);
    }
}
