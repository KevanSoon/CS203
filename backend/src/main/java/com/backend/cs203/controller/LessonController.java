package com.backend.cs203.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.dto.lesson.LessonPageDTO;
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
    public ResponseEntity<List<LessonSummaryResponse>> getAllAvailableLessons() {
            return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/page")
    public ResponseEntity<LessonPageDTO> getLessonPage(@RequestParam String title) {
            return ResponseEntity.ok(lessonService.getLessonPage(title));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-lessons/")
    public ResponseEntity<List<LessonSummaryResponse>> getUserCreatedLessons(Authentication authentication) {  
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
            return ResponseEntity.ok(lessonService.getUserCreatedLessons(user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-applications/")
    public ResponseEntity<List<LessonApplicationDTO>> getUserCreatedLessonApplications(Authentication authentication) {  
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
            return ResponseEntity.ok(lessonService.getUserCreatedLessonApplications(user.getId()));
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
}
