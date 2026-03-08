package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.progress.LessonProgressDTO;
import com.backend.cs203.dto.progress.MarkCardCompleteRequest;
import com.backend.cs203.service.UserProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class UserProgressController {

    private final UserProgressService userProgressService;

    /**
     * GET /api/progress/dashboard
     * Returns all lessons with progress info, ordered:
     * in_progress → not_started → completed
     */
    @GetMapping("/dashboard")
    public ResponseEntity<List<LessonProgressDTO>> getDashboard(Authentication authentication) {
        List<LessonProgressDTO> dashboard = userProgressService.getDashboard(authentication.getName());
        return ResponseEntity.ok(dashboard);
    }

    /**
     * GET /api/progress/lesson/{lessonId}
     * Returns detailed progress for a single lesson (with chapter breakdown).
     */
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<LessonProgressDTO> getLessonProgress(
            @PathVariable Integer lessonId,
            Authentication authentication) {
        LessonProgressDTO progress = userProgressService.getLessonProgress(authentication.getName(), lessonId);
        return ResponseEntity.ok(progress);
    }

    /**
     * POST /api/progress/lesson/{lessonId}/start
     * Creates an in_progress row (or updates last_accessed_at if already started).
     */
    @PostMapping("/lesson/{lessonId}/start")
    public ResponseEntity<Void> startLesson(
            @PathVariable Integer lessonId,
            Authentication authentication) {
        userProgressService.startLesson(authentication.getName(), lessonId);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/progress/card/complete
     * Marks a card as completed. Auto-creates lesson progress if needed.
     * Auto-checks if lesson is now fully completed.
     */
    @PostMapping("/card/complete")
    public ResponseEntity<Void> markCardComplete(
            @RequestBody MarkCardCompleteRequest request,
            Authentication authentication) {
        userProgressService.markCardComplete(authentication.getName(), request.getCardId());
        return ResponseEntity.ok().build();
    }
}
