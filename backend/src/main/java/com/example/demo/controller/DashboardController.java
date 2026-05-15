package com.example.demo.controller;

import com.example.demo.dto.DashboardDataDto;
import com.example.demo.service.DashboardService;
import com.example.demo.service.ExcelReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;
    private final ExcelReportService excelReportService;

    @GetMapping("/data")
    public ResponseEntity<DashboardDataDto> getDashboard(
            @RequestParam List<String> projects,
            @RequestParam String from,
            @RequestParam String to) {
        LocalDateTime fromDt = LocalDateTime.parse(from);
        LocalDateTime toDt = LocalDateTime.parse(to);
        return ResponseEntity.ok(dashboardService.getDashboardData(projects, fromDt, toDt));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam List<String> projects,
            @RequestParam String from,
            @RequestParam String to) {
        try {
            LocalDateTime fromDt = LocalDateTime.parse(from);
            LocalDateTime toDt = LocalDateTime.parse(to);
            byte[] file = excelReportService.generateReport(projects, fromDt, toDt);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dashboard_report.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(file);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}