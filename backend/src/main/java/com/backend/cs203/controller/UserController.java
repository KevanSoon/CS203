package com.backend.cs203.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.profile.UpdateProfileDTO;
import com.backend.cs203.entity.User;
import com.backend.cs203.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "profile-controller", description = "User Profile Management")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "Authentication required"
            ));
        }

        String username = auth.getName();

        UpdateProfileDTO profile = userService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PatchMapping
    public ResponseEntity<?> updateProfile(@RequestBody(required = false) UpdateProfileDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "Authentication required"
            ));
        }

        if (dto == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Bad Request",
                "message", "Request body is required"
            ));
        }

        String username = auth.getName();

        User updatedUser = userService.updateProfile(username, dto);
        return ResponseEntity.ok(updatedUser);
    }
}

