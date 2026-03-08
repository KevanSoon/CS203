package com.backend.cs203.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_result")
@Data
@NoArgsConstructor
public class QuizResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "chapter_id", nullable = false)
    private Integer chapterId;

    @Column(nullable = false)
    private Double score; // percentage

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Column(nullable=false)
    private Integer attempts;

    @PrePersist
    protected void onCreate() {
        takenAt = LocalDateTime.now();
    }
}