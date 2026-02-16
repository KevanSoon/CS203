package com.backend.cs203.controller;

import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.service.UserService;

import jakarta.transaction.Transactional;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class UserController {

    private final UserService userService;

    @GetMapping
    public UserResponse getProfile() {
        return userService.getMyProfile();
    }

    @DeleteMapping("/delete")
    @Transactional
    public ResponseEntity<?> deleteMyAccount() {
        try {
            userService.deleteMyAccount();
            return ResponseEntity.noContent().build(); // 204
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Internal Server Error",
                    "message", e.getMessage()
                ));
        }
    }
}
