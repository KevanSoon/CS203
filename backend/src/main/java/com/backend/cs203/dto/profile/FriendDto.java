package com.backend.cs203.dto.profile;

public class FriendDto {

    private final Integer id;
    private final String username;

    public FriendDto(Integer id, String username) {
        this.id = id;
        this.username = username;
    }

    public Integer getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}