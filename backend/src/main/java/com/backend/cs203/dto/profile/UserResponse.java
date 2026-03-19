package com.backend.cs203.dto.profile;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private String username;
    private String email;
    private String profilePictureUrl;
    private Integer streak;
    private LocalDate lastStreakDate;
    private long totalCompletedLessons;
}
