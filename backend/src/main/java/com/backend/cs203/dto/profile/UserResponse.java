package com.backend.cs203.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private String username;
    private String profilePictureUrl;
}
