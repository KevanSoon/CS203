package com.backend.cs203.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.service.LessonService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lesson")
public class LessonController {

    private final LessonService lessonService;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/")
    public ResponseEntity<List<LessonSummaryDTO>> getAllAvailableLessons() {
            return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-lessons/")
    public ResponseEntity<List<LessonSummaryDTO>> getUserCreatedLessons(Authentication authentication) {  
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(lessonService.getUserCreatedLessons(user.getId()));
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

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/page")
    public ResponseEntity<LessonPageDTO> getLessonPage(@RequestParam String title) {
            return ResponseEntity.ok(lessonService.getLessonPage(title));
    }
}
