package com.backend.cs203.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.Report;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final LessonRepository lessonRepository;

    public ReportService(ReportRepository reportRepository, LessonRepository lessonRepository) {
        this.reportRepository = reportRepository;
        this.lessonRepository = lessonRepository;
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
        report.setLastUpdate(Report.Updaters.root);

        reportRepository.save(report);
    }

    public void updateReportStatusAndSuspendLesson(Integer reportId, String status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(Report.ReportStatus.valueOf(status.trim().toLowerCase(Locale.ROOT)));
        report.setLastUpdate(Report.Updaters.root);

        Lesson lesson = report.getLesson();
        if (lesson == null) {
            throw new RuntimeException("Lesson not found for report");
        }
        lesson.setStatus(Lesson.LessonStatus.suspended);

        lessonRepository.save(lesson);
        reportRepository.save(report);
    }

    public void updateReportRemarks(Integer reportId, String remarks) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setRemarks(remarks.trim());
        report.setLastUpdate(Report.Updaters.admin);
        reportRepository.save(report);
    }
}
