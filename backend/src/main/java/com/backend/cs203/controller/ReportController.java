package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.backend.cs203.service.ReportService;
import com.backend.cs203.dto.report.ReportDTO;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    private final ReportService reportService;


    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PreAuthorize("hasRole('ROOT')")
    @GetMapping("/root")
    public ResponseEntity<List<ReportDTO>> getAllReports() {
            return ResponseEntity.ok(reportService.getAllLessonReports());
    }
}

