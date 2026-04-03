package com.backend.cs203.dto.profile;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserProfileDto {
    private final Integer userId;
    private final String username;
    private final String profilePictureUrl;
    private final int streak;
    private final int friendCount;
    @JsonProperty("isFriend")
    private final boolean isFriend;
    private final boolean hasPendingRequest;
    private final boolean hasIncomingRequest;
    private final List<BasicUserDto> commonFriends;
    private final List<FriendDto> friendLeaderboard;
}