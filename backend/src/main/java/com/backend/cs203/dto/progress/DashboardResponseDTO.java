package com.backend.cs203.dto.progress;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper response for GET /api/progress/dashboard.
 * Bundles lesson progress list with a one-time streakBroken flag.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDTO {
    private List<DashboardProgressDTO> progress;
    private boolean streakBroken;
}
