package com.backend.cs203.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "friendship")
@IdClass(FriendshipId.class)
public class Friendship {

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id1", nullable = false)
    private User user1;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id2", nullable = false)
    private User user2;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status;

    protected Friendship() {}

    public Friendship(User user1, User user2, FriendshipStatus status) {
        this.user1 = user1;
        this.user2 = user2;
        this.status = status;
    }

    public User getUser1() {
        return user1;
    }

    public User getUser2() {
        return user2;
    }

    public FriendshipStatus getStatus() {
        return status;
    }

    public void setStatus(FriendshipStatus status) {
        this.status = status;
    }
}