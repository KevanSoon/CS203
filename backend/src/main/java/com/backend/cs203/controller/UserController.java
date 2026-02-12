package com.backend.cs203.controller;

import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.service.UserService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/api/profile")
    public UserResponse getProfile() {
        return userService.getMyProfile();
    }
}
