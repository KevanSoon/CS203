package com.backend.cs203.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    void getAllLessonReports_returnsListFromRepository() {
        ReportDTO dto = mock(ReportDTO.class);
        when(reportRepository.findAllLessonReports()).thenReturn(List.of(dto));

        List<ReportDTO> result = reportService.getAllLessonReports();

        assertEquals(1, result.size());
        verify(reportRepository).findAllLessonReports();
    }

    @Test
    void getAllLessonReports_returnsEmptyListWhenNoReports() {
        when(reportRepository.findAllLessonReports()).thenReturn(Collections.emptyList());

        List<ReportDTO> result = reportService.getAllLessonReports();

        assertTrue(result.isEmpty());
        verify(reportRepository).findAllLessonReports();
    }
}