package com.backend.cs203.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.lesson.AdminLessonStatsDTO;
import com.backend.cs203.dto.lesson.CreateLessonRequest;
import com.backend.cs203.dto.lesson.CreateLessonResponse;
import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonRatingDTO;
import com.backend.cs203.dto.lesson.LessonReviewRequest;
import com.backend.cs203.dto.lesson.LessonReviewResponse;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.dto.review.ReviewDTO;
import com.backend.cs203.dto.review.ReviewRequestDTO;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.service.LessonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lesson")
public class LessonController {

    private final LessonService lessonService;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/")
    public ResponseEntity<List<LessonSummaryResponse>> getAllAvailableLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-lessons/")
    public ResponseEntity<List<LessonApplicationDTO>> getUserCreatedLessons(Authentication authentication) {
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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/stats")
    public ResponseEntity<AdminLessonStatsDTO> getAdminLessonStats(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        return ResponseEntity.ok(lessonService.getAdminLessonStats(user.getId()));
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
            @RequestBody ReviewRequestDTO request,
            Authentication authentication) {

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        lessonService.submitReview(lessonId, user.getId(), request.getRating(), request.getFeedback());
        return ResponseEntity.ok("Review submitted successfully");
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{lessonId}/review")
    public ResponseEntity<Map<String, Object>> getUserReview(
            @PathVariable Integer lessonId,
            Authentication authentication) {

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasReviewed = reviewRepository.existsByReviewedByIdAndLessonId(user.getId(), lessonId);
        Map<String, Object> response = new HashMap<>();
        response.put("hasReviewed", hasReviewed);
        if (hasReviewed) {
            ReviewDTO reviewDto = lessonService.getUserReview(lessonId, user.getId());
            response.put("review", reviewDto);
        }

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<CreateLessonResponse> createLesson(
            @Valid @ModelAttribute CreateLessonRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        CreateLessonResponse response = lessonService.createLesson(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/page")
    public ResponseEntity<LessonPageDTO> getAdminLessonPage(
            @RequestParam String title,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        return ResponseEntity.ok(lessonService.getAdminLessonPage(title, user.getId()));
    }

    @PreAuthorize("hasRole('ROOT')")
    @GetMapping("/root/page")
    public ResponseEntity<LessonPageDTO> getRootLessonPage(@RequestParam String title) {
        return ResponseEntity.ok(lessonService.getRootLessonApplicationPage(title));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update")
    public ResponseEntity<CreateLessonResponse> updateLesson(
            @RequestParam String originalTitle,
            @Valid @ModelAttribute CreateLessonRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        CreateLessonResponse response = lessonService.updateLesson(originalTitle, request, user);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/tags")
    public ResponseEntity<List<String>> getAllTags() {
        return ResponseEntity.ok(lessonService.getAllTags());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/check-title")
    public ResponseEntity<java.util.Map<String, Boolean>> checkTitleAvailability(@RequestParam String title) {
        boolean taken = lessonService.isTitleTaken(title);
        return ResponseEntity.ok(java.util.Map.of("available", !taken));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{lessonId}")
    public ResponseEntity<String> deleteLesson(
            @PathVariable Integer lessonId,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        lessonService.deleteLesson(lessonId, user.getId());
        return ResponseEntity.ok("Lesson deleted successfully");
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{lessonId}/reviews")
    public ResponseEntity<List<LessonReviewResponse>> getReviews(
            @PathVariable Integer lessonId) {
        return ResponseEntity.ok(lessonService.getReviewsForLesson(lessonId));
    }

    @PreAuthorize("hasRole('ROOT')")
    @PatchMapping("/applications/review")
    public ResponseEntity<?> reviewLessonApplication(
            @Valid @RequestBody LessonReviewRequest request) {
        lessonService.reviewLessonApplication(request.getTitle(), request.getAction());
        String verb = "approve".equals(request.getAction()) ? "approved" : "rejected";
        return ResponseEntity.ok(Map.of("message", "Lesson successfully " + verb + "."));
    }
}
