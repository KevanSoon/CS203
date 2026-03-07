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
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.repository.ReportRepository;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportService reportService;

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

    assertThrows(IllegalArgumentException.class,
            () -> reportService.updateReportStatus(reportId, "not-a-real-status"));

    verify(reportRepository).findById(reportId);
    verify(reportRepository, never()).save(report);
}
}