package com.backend.cs203.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.progress.DashboardResponseDTO;
import com.backend.cs203.dto.progress.LessonProgressDTO;
import com.backend.cs203.dto.progress.MarkCardCompleteRequest;
import com.backend.cs203.service.UserProgressService;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class UserProgressController {

    private final UserProgressService userProgressService;
    private final UserRepository userRepository;

    /**
     * GET /api/progress/dashboard Returns lightweight progress-only data for
     * every approved lesson. Lesson metadata (title, image, tags) comes from
     * GET /api/lesson/.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDTO> getDashboard(Authentication authentication) {
        DashboardResponseDTO dashboard = userProgressService.getDashboard(authentication.getName());
        return ResponseEntity.ok(dashboard);
    }

    /**
     * GET /api/progress/lesson/{lessonId} Returns detailed progress for a
     * single lesson (with chapter breakdown).
     */
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<LessonProgressDTO> getLessonProgress(
            @PathVariable Integer lessonId,
            Authentication authentication) {
        LessonProgressDTO progress = userProgressService.getLessonProgress(authentication.getName(), lessonId);
        return ResponseEntity.ok(progress);
    }

    /**
     * POST /api/progress/card/complete Marks a card as completed. Auto-creates
     * lesson progress if needed. Auto-checks if lesson is now fully completed.
     */
    @PostMapping("/card/complete")
    public ResponseEntity<Void> markCardComplete(
            @RequestBody MarkCardCompleteRequest request,
            Authentication authentication) {
        userProgressService.markCardComplete(authentication.getName(), request.getCardId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/lesson/{lessonId}")
    public ResponseEntity<Void> resetLessonProgress(
            @PathVariable Integer lessonId,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        userProgressService.resetLessonProgress(user.getId(), lessonId);
        return ResponseEntity.ok().build();
    }
}
