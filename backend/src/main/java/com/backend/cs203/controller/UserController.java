package com.backend.cs203.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/api/profile")
    public UserResponse getProfile() {
        return userService.getMyProfile();
    }

    @PatchMapping(
        value = "/api/profile",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public UserResponse updateProfile(
        @ModelAttribute UpdateProfileRequest request
    ) {
        return userService.updateMyProfile(request);
    }

    @DeleteMapping("/api/profile")
    public ResponseEntity<Void> deleteMyAccount(@RequestBody DeleteAccountRequest request) {
        userService.deleteMyAccount(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/profile")
    public ResponseEntity<Boolean> verifyPassword(@RequestBody DeleteAccountRequest request) {
        boolean result = userService.verifyMyPassword(request.getPassword());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/users/search")
    public List<UserSearchResult> searchUsers(
        @RequestParam String username
    ) {
        return userService.searchUsers(username);
    }

    @GetMapping("/api/users/username-available")
    public Map<String, Boolean> usernameAvailable(@RequestParam String username) {

        boolean exists = userRepository.existsByUsername(username.trim());

        return Map.of("available", !exists);
    }
}