package com.backend.cs203.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.dto.report.ReportCreateDTO;
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.Report;
import com.backend.cs203.entity.User;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;

    public ReportService(ReportRepository reportRepository, LessonRepository lessonRepository, ChapterRepository chapterRepository) {
        this.reportRepository = reportRepository;
        this.lessonRepository = lessonRepository;
        this.chapterRepository = chapterRepository;
    }

    public void createReport(ReportCreateDTO dto, User user) {
        Lesson lesson = lessonRepository.findById(dto.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        Chapter chapter = null;

        if (dto.getChapterId() != null) {
            chapter = chapterRepository.findById(dto.getChapterId())
                    .orElseThrow(() -> new RuntimeException("Chapter not found"));
        }

        Report report = new Report();
        
        report.setTitle(dto.getTitle().trim());
        report.setDescription(dto.getDescription().trim());
        report.setType(
            Report.ReportType.valueOf(dto.getType().trim().toLowerCase())
        );
        report.setStatus(Report.ReportStatus.reported);
        report.setRemarks("");
        report.setReportedBy(user);
        report.setLesson(lesson);
        report.setChapter(chapter);
        report.setLastUpdate(null);

        reportRepository.save(report);
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
