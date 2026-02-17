package com.backend.cs203.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "friendship",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"username1", "username2"})
    }
)
public class Friendship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username1", nullable = false)
    private String requester;

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

    public Long getId() {
        return id;
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
