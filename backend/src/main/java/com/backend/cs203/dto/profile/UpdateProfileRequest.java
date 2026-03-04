package com.backend.cs203.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UpdateProfileRequest {
    private String username;
    private String email;
    private String password;
}