package com.backend.cs203.dto.report;

import java.time.LocalDateTime;

public interface ReportDTO {
    Integer getId();
    String getTitle();
    String getDescription();
    String getStatus();
    String getType();
    String getRemarks();
    String getLastUpdate();
    String getReportedBy();
    String getLessonTitle();
    String getChapterTitle();
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
}
