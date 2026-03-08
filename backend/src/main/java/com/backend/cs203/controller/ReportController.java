package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.security.core.Authentication;

import com.backend.cs203.service.ReportService;
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<List<ReportDTO>> getUserCreatedLessonReports(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found. Refresh and try again"));
        return ResponseEntity.ok(reportService.getUserCreatedLessonReports(user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/remarks")
    public ResponseEntity<Void> updateReportRemarks(@RequestParam Integer reportId, @RequestParam String remarks) {
        reportService.updateReportRemarks(reportId, remarks);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ROOT')")
    @GetMapping("/root")
    public ResponseEntity<List<ReportDTO>> getAllReportsForRoot() {
        return ResponseEntity.ok(reportService.getAllLessonReportsForRoot());
    }

    @PreAuthorize("hasRole('ROOT')")
    @PatchMapping("/root/status")
    public ResponseEntity<Void> updateReportStatus(@RequestParam Integer reportId, @RequestParam String status) {
        reportService.updateReportStatus(reportId, status);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ROOT')")
    @PatchMapping("/root/suspend")
    public ResponseEntity<Void> updateReportStatusAndSuspendLesson(@RequestParam Integer reportId, @RequestParam String status) {
        reportService.updateReportStatusAndSuspendLesson(reportId, status);
        return ResponseEntity.noContent().build();
    }

}
