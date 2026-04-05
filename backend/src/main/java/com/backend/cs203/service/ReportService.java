package com.backend.cs203.service;

import java.util.List;
import com.backend.cs203.dto.report.ReportCreateDTO;
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.entity.User;

public interface ReportService {

    public void createReport(ReportCreateDTO dto, User user);

    public List<ReportDTO> getUserCreatedLessonReports(Integer userId);

    public List<ReportDTO> getAllLessonReportsForRoot();

    public void updateReportStatus(Integer reportId, String status);

    public void updateReportStatusAndSuspendLesson(Integer reportId, String status);

    public void updateReportRemarks(Integer reportId, String remarks);

}
