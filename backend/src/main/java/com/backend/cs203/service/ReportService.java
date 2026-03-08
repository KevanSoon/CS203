package com.backend.cs203.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.entity.Report;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<ReportDTO> getUserCreatedLessonReports(Integer userId) {
        return reportRepository.findUserCreatedLessonReports(userId);
    }

    public List<ReportDTO> getAllLessonReportsForRoot() {
        return reportRepository.findAllLessonReportsForRoot();
    }

    public void updateReportStatus(Integer reportId, String status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(Report.ReportStatus.valueOf(status.trim().toLowerCase(Locale.ROOT)));
        reportRepository.save(report);
    }

    public void updateReportRemarks(Integer reportId, String remarks) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setRemarks(remarks.trim());
        reportRepository.save(report);
    }
}
