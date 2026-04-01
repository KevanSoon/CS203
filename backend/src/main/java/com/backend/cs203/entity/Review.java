package com.backend.cs203.entity;


import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "review")
public class Review {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Integer id;

   @Column(nullable = false)
   private Byte rating;

   @Column(nullable = false)
   private String feedback;

   @ManyToOne
   @JoinColumn(name = "reviewed_by", nullable = false)
   private User reviewedBy;

   @ManyToOne
   @JoinColumn(name = "lesson_id", nullable = false)
   private Lesson lesson;

   @Column(name = "created_at", insertable = false, updatable = false)
   private LocalDateTime createdAt;
}
