package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;
import com.backend.cs203.service.UserService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/api/profile")
    public UserResponse getProfile() {
        return userService.getMyProfile();
    }

    @PatchMapping("/api/profile")
    public UserResponse updateProfile(@RequestBody UpdateProfileRequest request) {
        return userService.updateMyProfile(request);    
    }

    @DeleteMapping("/api/profile/delete")
    public ResponseEntity<Void> deleteMyAccount(@RequestBody DeleteAccountRequest request) {
        userService.deleteMyAccount(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/users/search")
    public List<UserSearchResult> searchUsers(@RequestParam String username) {
        return userService.searchUsers(username);
    }
}
