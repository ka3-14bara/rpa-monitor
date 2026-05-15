package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDataDto {
    private Map<String, Long> errorsByProject;   // Для круговой диаграммы
    private Map<String, Long> errorsBySource;    // RPA vs JENKINS
    private List<TimeSeriesPointDto> errorsOverTime; // Для графика
    private long totalErrors;
}