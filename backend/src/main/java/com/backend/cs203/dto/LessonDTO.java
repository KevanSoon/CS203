package com.backend.cs203.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.backend.cs203.entity.Lesson;

public class LessonDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ChapterDTO> chapters = new ArrayList<>();

    public LessonDTO() {}

    // Simple DTO without nested chapters
    public LessonDTO(Lesson lesson) {
        this.id = lesson.getId();
        this.title = lesson.getTitle();
        this.description = lesson.getDescription();
        this.status = lesson.getStatus() != null ? lesson.getStatus().name() : null;
        this.createdAt = lesson.getCreatedAt();
        this.updatedAt = lesson.getUpdatedAt();
    }

    // Full DTO with nested chapters (each chapter contains its cards and quiz)
    public LessonDTO(Lesson lesson, boolean includeChapters) {
        this(lesson);
        if (includeChapters && lesson.getCards() != null) {
            // Group cards by chapter and create ChapterDTOs
            this.chapters = lesson.getCards().stream()
                .collect(Collectors.groupingBy(card -> card.getChapter()))
                .entrySet().stream()
                .map(entry -> new ChapterDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<ChapterDTO> getChapters() { return chapters; }
    public void setChapters(List<ChapterDTO> chapters) { this.chapters = chapters; }
}
