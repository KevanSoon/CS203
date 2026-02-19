package com.backend.cs203.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "friendship")
@IdClass(FriendshipId.class)
public class Friendship {

    @Id
    @Column(name = "username1", nullable = false)
    private String requester;

    @Id
    @Column(name = "username2", nullable = false)
    private String acceptor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status;

    protected Friendship() {}

    public Friendship(String requester, String acceptor, FriendshipStatus status) {
        this.requester = requester;
        this.acceptor = acceptor;
        this.status = status;
    }

    public String getRequester() {
        return requester;
    }

    public String getAcceptor() {
        return acceptor;
    }

    public FriendshipStatus getStatus() {
        return status;
    }

    public void setStatus(FriendshipStatus status) {
        this.status = status;
    }
}
