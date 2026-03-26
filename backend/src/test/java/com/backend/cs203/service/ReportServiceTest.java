package com.backend.cs203.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

import java.util.Optional;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.cs203.entity.Report;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.User;
import com.backend.cs203.dto.report.ReportCreateDTO;
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.service.VectorStoreService;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private VectorStoreService vectorStoreService;

    @InjectMocks
    private ReportService reportService;

    @Test
    void createReport_withLessonAndChapter_savesReportCorrectly() {
        // Arrange
        User user = User.builder().id(1).username("alice").build();
        Lesson lesson = new Lesson();
        lesson.setId(10);
        Chapter chapter = new Chapter();
        chapter.setId(5);

        ReportCreateDTO dto = new ReportCreateDTO();
        dto.setTitle("  Broken card  ");
        dto.setDescription("  Card content incorrect  ");
        dto.setType("high");
        dto.setLessonId(lesson.getId());
        dto.setChapterId(chapter.getId());

        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(chapterRepository.findById(chapter.getId())).thenReturn(Optional.of(chapter));

        // Act
        reportService.createReport(dto, user);

        // Assert
        verify(reportRepository).save(any(Report.class));
    }

    @Test
    void createReport_withLessonOnly_savesReportWithoutChapter() {
        // Arrange
        User user = User.builder().id(1).username("alice").build();
        Lesson lesson = new Lesson();
        lesson.setId(10);

        ReportCreateDTO dto = new ReportCreateDTO();
        dto.setTitle("  Missing lesson chapter  ");
        dto.setDescription("  Card content incorrect  ");
        dto.setType("medium");
        dto.setLessonId(lesson.getId());
        dto.setChapterId(null); // no chapter

        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));

        // Act
        reportService.createReport(dto, user);

        // Assert
        verify(reportRepository).save(any(Report.class));
    }

    @Test
    void createReport_lessonNotFound_throwsRuntimeException() {
        User user = User.builder().id(1).username("alice").build();
        ReportCreateDTO dto = new ReportCreateDTO();
        dto.setLessonId(999); 

        when(lessonRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reportService.createReport(dto, user));
        assertEquals("Lesson not found", ex.getMessage());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void createReport_chapterNotFound_throwsRuntimeException() {
        User user = User.builder().id(1).username("alice").build();
        Lesson lesson = new Lesson();
        lesson.setId(10);

        ReportCreateDTO dto = new ReportCreateDTO();
        dto.setLessonId(lesson.getId());
        dto.setChapterId(999);
        dto.setTitle("Broken chapter");
        dto.setDescription("Details");
        dto.setType("low");

        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(chapterRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reportService.createReport(dto, user));
        assertEquals("Chapter not found", ex.getMessage());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void getUserCreatedLessonReports_returnsListFromRepository() {
        Integer userId = 5;
        ReportDTO dto = mock(ReportDTO.class);
        when(reportRepository.findUserCreatedLessonReports(userId)).thenReturn(List.of(dto));

        List<ReportDTO> result = reportService.getUserCreatedLessonReports(userId);

        assertEquals(1, result.size());
        verify(reportRepository).findUserCreatedLessonReports(userId);
    }

    @Test
    void getUserCreatedLessonReports_returnsEmptyListWhenNoReports() {
        Integer userId = 5;
        when(reportRepository.findUserCreatedLessonReports(userId)).thenReturn(Collections.emptyList());

        List<ReportDTO> result = reportService.getUserCreatedLessonReports(userId);

        assertTrue(result.isEmpty());
        verify(reportRepository).findUserCreatedLessonReports(userId);
    }

    @Test
    void getAllLessonReportsForRoot_returnsListFromRepository() {
        ReportDTO dto = mock(ReportDTO.class);
        when(reportRepository.findAllLessonReportsForRoot()).thenReturn(List.of(dto));

        List<ReportDTO> result = reportService.getAllLessonReportsForRoot();

        assertEquals(1, result.size());
        verify(reportRepository).findAllLessonReportsForRoot();
    }

    @Test
    void getAllLessonReportsForRoot_returnsEmptyListWhenNoReports() {
        when(reportRepository.findAllLessonReportsForRoot()).thenReturn(Collections.emptyList());

        List<ReportDTO> result = reportService.getAllLessonReportsForRoot();

        assertTrue(result.isEmpty());
        verify(reportRepository).findAllLessonReportsForRoot();
    }
    @Test
    void updateReportStatus_updatesAndSavesReport() {
        Integer reportId = 1;
        Report report = new Report();
        report.setStatus(Report.ReportStatus.reported);

        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        reportService.updateReportStatus(reportId, "closed");

        assertEquals(Report.ReportStatus.closed, report.getStatus());
        verify(reportRepository).findById(reportId);
        verify(reportRepository).save(report);
    }

    @Test
    void updateReportStatus_reportNotFound_throwsRuntimeException() {
        Integer reportId = 999;
        when(reportRepository.findById(reportId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reportService.updateReportStatus(reportId, "closed"));

        assertEquals("Report not found", ex.getMessage());
        verify(reportRepository).findById(reportId);
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void updateReportStatus_invalidStatus_throwsIllegalArgumentException() {
        Integer reportId = 1;
        Report report = new Report();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> reportService.updateReportStatus(reportId, "not-a-real-status"));
        assertTrue(ex.getMessage() != null && !ex.getMessage().isBlank());

        verify(reportRepository).findById(reportId);
        verify(reportRepository, never()).save(report);
    }

    @Test
    void updateReportStatusAndSuspendLesson_updatesReportAndSuspendsLesson() {
        Integer reportId = 1;
        Lesson lesson = new Lesson();
        lesson.setStatus(Lesson.LessonStatus.approved);

        Report report = new Report();
        report.setStatus(Report.ReportStatus.reported);
        report.setLesson(lesson);

        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        reportService.updateReportStatusAndSuspendLesson(reportId, "closed");

        assertEquals(Report.ReportStatus.closed, report.getStatus());
        assertEquals(Lesson.LessonStatus.suspended, lesson.getStatus());
        verify(reportRepository).findById(reportId);
        verify(lessonRepository).save(lesson);
        verify(reportRepository).save(report);
        verify(vectorStoreService).deleteLesson(lesson.getId());
    }

    @Test
    void updateReportStatusAndSuspendLesson_reportNotFound_throwsRuntimeException() {
        Integer reportId = 999;
        when(reportRepository.findById(reportId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reportService.updateReportStatusAndSuspendLesson(reportId, "closed"));

        assertEquals("Report not found", ex.getMessage());
        verify(reportRepository).findById(reportId);
        verify(lessonRepository, never()).save(any(Lesson.class));
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void updateReportStatusAndSuspendLesson_lessonMissing_throwsRuntimeException() {
        Integer reportId = 1;
        Report report = new Report();
        report.setStatus(Report.ReportStatus.reported);
        report.setLesson(null);
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reportService.updateReportStatusAndSuspendLesson(reportId, "closed"));

        assertEquals("Lesson not found for report", ex.getMessage());
        verify(reportRepository).findById(reportId);
        verify(lessonRepository, never()).save(any(Lesson.class));
        verify(reportRepository, never()).save(any(Report.class));
    }
}