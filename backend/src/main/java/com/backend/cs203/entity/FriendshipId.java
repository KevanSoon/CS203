package com.backend.cs203.entity;

import java.io.Serializable;
import java.util.Objects;

public class FriendshipId implements Serializable {

    private String username1;
    private String username2;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FriendshipId)) return false;
        FriendshipId that = (FriendshipId) o;
        return Objects.equals(username1, that.username1)
            && Objects.equals(username2, that.username2);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username1, username2);
    }
}

