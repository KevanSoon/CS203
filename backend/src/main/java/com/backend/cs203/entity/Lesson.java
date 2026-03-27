package com.backend.cs203.entity;


import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;


@Entity
@Table(name = "lesson")
@Data
public class Lesson {


   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Integer id;


   @Column(unique = true, nullable = false)
   private String title;


   @Column(columnDefinition = "TEXT")
   private String description;


   @Enumerated(EnumType.STRING)
   @Column(nullable = false)
   private LessonStatus status;


   @Column(name = "created_at", nullable = false, updatable = false)
   private LocalDateTime createdAt;


   @Column(name = "deleted_at")
   private LocalDateTime deletedAt;


   @ManyToOne(fetch = FetchType.LAZY, optional = false)
   @JoinColumn(name = "created_by_id", nullable = false)
   private User createdBy;


   @Column(name = "lesson_picture_url")
   private String lessonPictureUrl;

   @Column(name = "updated_at")
   private LocalDateTime updatedAt;

   @PrePersist
   protected void onCreate() {
       createdAt = LocalDateTime.now();
   }


   public enum LessonStatus {
       saved, pending, approved, rejected, suspended
   }
}

