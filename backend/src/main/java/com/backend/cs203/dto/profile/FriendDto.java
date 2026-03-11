package com.backend.cs203.dto.profile;

public class FriendDto {

    private final Integer id;
    private final String username;
    private final String profilePictureUrl;

    public FriendDto(Integer id, String username, String profilePictureUrl) {
        this.id = id;
        this.username = username;
        this.profilePictureUrl = profilePictureUrl;
    }

    public Integer getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
}