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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;
import com.backend.cs203.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public UserResponse getProfile() {
        return userService.getMyProfile();
    }

    @PatchMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse updateProfile(@ModelAttribute UpdateProfileRequest request) {
        return userService.updateMyProfile(request);
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteMyAccount(@RequestBody DeleteAccountRequest request) {
        userService.deleteMyAccount(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/profile")
    public ResponseEntity<Boolean> verifyPassword(@RequestBody DeleteAccountRequest request) {
        boolean result = userService.verifyMyPassword(request.getPassword());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/search")
    public List<UserSearchResult> searchUsers(@RequestParam String username) {
        return userService.searchUsers(username);
    }

    @GetMapping("/users/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean available = userService.checkUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("available", available));
    }
}