package com.backend.cs203.controller;

import java.util.List;

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
import com.backend.cs203.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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

    @DeleteMapping(
        value = "/api/profile/delete",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Void> deleteMyAccount(
        @RequestBody DeleteAccountRequest request
    ) {
        userService.deleteMyAccount(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(
        value = "/api/profile/verify-password",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Boolean> verifyPassword(
        @RequestBody DeleteAccountRequest request
    ) {
        boolean valid = userService.verifyMyPassword(request.getPassword());
        return ResponseEntity.ok(valid);
    }

    @GetMapping("/api/users/search")
    public List<UserSearchResult> searchUsers(
        @RequestParam String username
    ) {
        return userService.searchUsers(username);
    }
}