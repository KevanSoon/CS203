package com.backend.cs203.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BasicUserDto {
    private final Integer id;
    private final String username;
    private final String profilePictureUrl;
}