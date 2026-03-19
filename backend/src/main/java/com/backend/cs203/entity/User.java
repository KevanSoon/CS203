package com.backend.cs203.entity;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(length = 50, unique = true, nullable = false)
    private String username;

    @Column(length = 100, nullable = false)
    private String email;

    @Column(length = 100, nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserType usertype;

    private Integer streak;

    @Column(name = "last_streak_date")
    private LocalDate lastStreakDate;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "last_login")
    private Instant lastLogin;

    @Column(name = "deactivated_at")
    private Instant deactivatedAt;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    public enum UserType {
        user,
        admin,
        root
    }
}
