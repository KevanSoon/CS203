package com.backend.cs203.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.dto.report.ReportDTO;

@Service
public class ReportService {

    private final ReportRepository reportRepository;


    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<ReportDTO> getAllLessonReports() {
        return reportRepository.findAllLessonReports();
    }
}