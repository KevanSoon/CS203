package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.backend.cs203.dto.lesson.*;
import com.backend.cs203.service.LessonService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lesson")
public class LessonController {

    private final LessonService lessonService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/")
    public ResponseEntity<List<LessonSummaryDTO>> getAllAvailableLessons() {
            return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-lessons/")
    public ResponseEntity<List<LessonSummaryDTO>> getUserCreatedLessons() {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return ResponseEntity.ok(lessonService.getUserCreatedLessons(username));
    }

    @PreAuthorize("hasRole('ROOT')")
    @GetMapping("/applications/")
    public ResponseEntity<List<LessonApplicationDTO>> getAllLessonApplications() {
            return ResponseEntity.ok(lessonService.getAllLessonApplications());
    }

    @PreAuthorize("hasRole('ROOT')")
    @GetMapping("/applications/pending")
    public ResponseEntity<List<LessonSummaryDTO>> getPendingLessonApplications() {
            return ResponseEntity.ok(lessonService.getPendingLessonApplications());
    }
}
