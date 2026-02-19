package com.backend.cs203.entity;

import java.io.Serializable;
import java.util.Objects;

public class FriendshipId implements Serializable {

    private String requester;
    private String acceptor;

    public FriendshipId() {}

    public FriendshipId(String requester, String acceptor) {
        this.requester = requester;
        this.acceptor = acceptor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FriendshipId)) return false;
        FriendshipId that = (FriendshipId) o;
        return Objects.equals(requester, that.requester) &&
               Objects.equals(acceptor, that.acceptor);
    }

    @Override
    public int hashCode() {
        return Objects.hash(requester, acceptor);
    }
}