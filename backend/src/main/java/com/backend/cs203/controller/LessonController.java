package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonRatingDTO;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.service.LessonService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lesson")
public class LessonController {

    private final LessonService lessonService;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/")
    public ResponseEntity<List<LessonSummaryResponse>> getAllAvailableLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-lessons/")
    public ResponseEntity<List<LessonSummaryResponse>> getUserCreatedLessons(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        return ResponseEntity.ok(lessonService.getUserCreatedLessons(user.getId()));
    }

    @PreAuthorize("hasRole('ROOT')")
    @GetMapping("/applications/")
    public ResponseEntity<List<LessonApplicationDTO>> getAllLessonApplications() {
        return ResponseEntity.ok(lessonService.getAllLessonApplications());
    }

    @PreAuthorize("hasRole('ROOT')")
    @GetMapping("/applications/pending")
    public ResponseEntity<List<LessonSummaryResponse>> getPendingLessonApplications() {
        return ResponseEntity.ok(lessonService.getPendingLessonApplications());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-applications/")
    public ResponseEntity<List<LessonApplicationDTO>> getUserCreatedLessonApplications(Authentication authentication) { // ← NEW
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        return ResponseEntity.ok(lessonService.getUserCreatedLessonApplications(user.getId()));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/page")
    public ResponseEntity<LessonPageDTO> getLessonPage(@RequestParam String title) {
        return ResponseEntity.ok(lessonService.getLessonPage(title));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{lessonId}/rating")
    public ResponseEntity<LessonRatingDTO> getLessonRating(
            @PathVariable Integer lessonId,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(lessonService.getLessonRating(lessonId, user.getId()));
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/{lessonId}/review")
    public ResponseEntity<String> submitReview(
            @PathVariable Integer lessonId,
            @RequestParam int rating,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        lessonService.submitReview(lessonId, user.getId(), rating);
        return ResponseEntity.ok("Review submitted successfully");
    }
}

