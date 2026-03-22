package com.backend.cs203.entity;
 
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonReview {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false)
    private Integer rating;
 
    @Column(length = 1000)
    private String feedback;
 
    @Column(name = "reviewed_by", nullable = false)
    private Long reviewedBy;
 
    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;
 
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
