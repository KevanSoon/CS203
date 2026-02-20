package com.backend.cs203.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserResponse;
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
}
