package com.backend.cs203.service;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.auth.AuthResponse;
import com.backend.cs203.dto.auth.LoginRequest;
import com.backend.cs203.dto.auth.UserInfoResponse;
import com.backend.cs203.entity.User;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.JwtUtil;

import lombok.RequiredArgsConstructor;

public interface AuthService {

    AuthResponse login(LoginRequest request);
    UserInfoResponse getCurrentUser(String username);

    @Service
    @RequiredArgsConstructor
    class Impl implements AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final SupabaseStorageService supabaseStorageService;

        @Override
        @Transactional
        public AuthResponse login(LoginRequest request) {
            User user = getActiveUser(request.getUsername());

            validatePassword(request.getPassword(), user.getPassword());

            updateLastLogin(user);

            String token = jwtUtil.generateToken(user);
            String profilePictureUrl = generateProfilePictureUrl(user);

            return buildAuthResponse(user, token, profilePictureUrl);
        }

        @Override
        public UserInfoResponse getCurrentUser(String username) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AuthException("User not found. Refresh and try again"));

            return UserInfoResponse.builder()
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .usertype(user.getUsertype().name())
                    .build();
        }

        // -----------------------
        // Internal helper methods
        // -----------------------

        private User getActiveUser(String username) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AuthException("Invalid username or password. Please try again"));

            if (user.getDeactivatedAt() != null) {
                throw new AuthException("Account has been deactivated. Please contact the support team");
            }

            return user;
        }

        private void validatePassword(String rawPassword, String encodedPassword) {
            if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
                throw new AuthException("Invalid username or password. Please try again");
            }
        }

        private void updateLastLogin(User user) {
            user.setLastLogin(Instant.now());
            userRepository.save(user);
        }

        private String generateProfilePictureUrl(User user) {
            return user.getProfilePictureUrl() != null
                    ? supabaseStorageService.getSignedUrl(user.getProfilePictureUrl(), 3600)
                    : null;
        }

        private AuthResponse buildAuthResponse(User user, String token, String profilePictureUrl) {
            return AuthResponse.builder()
                    .token(token)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .usertype(user.getUsertype().name())
                    .profilePictureUrl(profilePictureUrl)
                    .build();
        }
    }
}