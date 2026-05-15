package com.example.demo.service;

import com.example.demo.dto.DashboardDataDto;
import com.example.demo.dto.TimeSeriesPointDto;
import com.example.demo.entity.JenkinsError;
import com.example.demo.entity.RpaError;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xddf.usermodel.chart.AxisCrosses;
import org.apache.poi.xddf.usermodel.chart.AxisPosition;
import org.apache.poi.xddf.usermodel.chart.ChartTypes;
import org.apache.poi.xddf.usermodel.chart.XDDFDataSourcesFactory;
import org.apache.poi.xddf.usermodel.chart.XDDFCategoryAxis;
import org.apache.poi.xddf.usermodel.chart.XDDFChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFDataSource;
import org.apache.poi.xddf.usermodel.chart.XDDFNumericalDataSource;
import org.apache.poi.xddf.usermodel.chart.XDDFValueAxis;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFDrawing;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExcelReportService {
    private final DashboardService dashboardService;

    public byte[] generateReport(List<String> projects, LocalDateTime from, LocalDateTime to) throws Exception {
        DashboardDataDto data = dashboardService.getDashboardData(projects, from, to);
        List<RpaError> rpaErrors = dashboardService.getRpaErrors(projects, from, to);
        List<JenkinsError> jenkinsErrors = dashboardService.getJenkinsErrors(projects, from, to);

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            // 1. Лист дашборда + диаграммы
            createDashboardSheet(wb, data);
            // 2. Листы с деталями
            createDetailSheet(wb, "RPA_Oшибки", rpaErrors, true);
            createDetailSheet(wb, "Jenkins_Oшибки", jenkinsErrors, false);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    private void createDashboardSheet(XSSFWorkbook wb, DashboardDataDto data) {
        XSSFSheet sheet = wb.createSheet("Дашборд");
        int rowIdx = 0;

        // Заголовок
        Row header = sheet.createRow(rowIdx++);
        header.createCell(0).setCellValue("Проект");
        header.createCell(1).setCellValue("Ошибки");

        // Данные по проектам (для круговой)
        int pieDataStart = rowIdx;
        for (Map.Entry<String, Long> entry : data.getErrorsByProject().entrySet()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(entry.getKey());
            r.createCell(1).setCellValue(entry.getValue());
        }
        int pieDataEnd = rowIdx - 1;

        // Данные по времени (для графика)
        rowIdx += 2;
        Row timeHeader = sheet.createRow(rowIdx++);
        timeHeader.createCell(0).setCellValue("Дата");
        timeHeader.createCell(1).setCellValue("RPA");
        timeHeader.createCell(2).setCellValue("Jenkins");

        int lineDataStart = rowIdx;
        for (TimeSeriesPointDto pt : data.getErrorsOverTime()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(pt.getDate());
            r.createCell(1).setCellValue(pt.getRpaCount());
            r.createCell(2).setCellValue(pt.getJenkinsCount());
        }
        int lineDataEnd = rowIdx - 1;

        // Круговая диаграмма
        XSSFDrawing drawing = sheet.createDrawingPatriarch();
        XSSFClientAnchor pieAnchor = drawing.createAnchor(0, 0, 0, 0, 4, 0, 10, 15);
        XSSFChart pieChart = drawing.createChart(pieAnchor);
        XDDFChartData pieData = pieChart.createData(ChartTypes.PIE, null, null);
        XDDFDataSource<String> pieCat = XDDFDataSourcesFactory.fromStringCellRange(sheet, new CellRangeAddress(pieDataStart, pieDataEnd, 0, 0));
        XDDFNumericalDataSource<Double> pieVal = XDDFDataSourcesFactory.fromNumericCellRange(sheet, new CellRangeAddress(pieDataStart, pieDataEnd, 1, 1));
        pieData.addSeries(pieCat, pieVal);
        pieChart.plot(pieData);

        // Линейный график
        XSSFClientAnchor lineAnchor = drawing.createAnchor(0, 0, 0, 0, 4, 16, 12, 30);
        XSSFChart lineChart = drawing.createChart(lineAnchor);
        XDDFCategoryAxis bottomAxis = lineChart.createCategoryAxis(AxisPosition.BOTTOM);
        XDDFValueAxis leftAxis = lineChart.createValueAxis(AxisPosition.LEFT);
        leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);

        XDDFChartData lineData = lineChart.createData(ChartTypes.LINE, bottomAxis, leftAxis);
        XDDFDataSource<String> dates = XDDFDataSourcesFactory.fromStringCellRange(sheet, new CellRangeAddress(lineDataStart, lineDataEnd, 0, 0));
        XDDFNumericalDataSource<Double> rpaVals = XDDFDataSourcesFactory.fromNumericCellRange(sheet, new CellRangeAddress(lineDataStart, lineDataEnd, 1, 1));
        XDDFNumericalDataSource<Double> jenkinsVals = XDDFDataSourcesFactory.fromNumericCellRange(sheet, new CellRangeAddress(lineDataStart, lineDataEnd, 2, 2));

        XDDFChartData.Series s1 = lineData.addSeries(dates, rpaVals);
        s1.setTitle("RPA", null);
        XDDFChartData.Series s2 = lineData.addSeries(dates, jenkinsVals);
        s2.setTitle("Jenkins", null);
        lineChart.plot(lineData);
    }

    private void createDetailSheet(XSSFWorkbook wb, String name, List<?> errors, boolean isRpa) {
        XSSFSheet sheet = wb.createSheet(name);
        Row header = sheet.createRow(0);
        String[] cols = isRpa
                ? new String[]{"ID", "Проект", "Stage", "Тип", "Сообщение", "Компьютер", "Дата", "Прочитано"}
                : new String[]{"ID", "Проект", "Stage", "Тип", "Сообщение", "Node", "Дата", "Прочитано"};
        for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);

        int rowIdx = 1;
        for (Object err : errors) {
            Row r = sheet.createRow(rowIdx++);
            if (isRpa) {
                RpaError e = (RpaError) err;
                r.createCell(0).setCellValue(e.getId());
                r.createCell(1).setCellValue(e.getProjectNumber());
                r.createCell(2).setCellValue(e.getStage());
                r.createCell(3).setCellValue(e.getExType());
                r.createCell(4).setCellValue(e.getExMessage());
                r.createCell(5).setCellValue(e.getComputerName());
                r.createCell(6).setCellValue(e.getCreatedAt().toString());
                r.createCell(7).setCellValue(e.getIsRead() ? "Да" : "Нет");
            } else {
                JenkinsError e = (JenkinsError) err;
                r.createCell(0).setCellValue(e.getId());
                r.createCell(1).setCellValue(e.getProjectNumber());
                r.createCell(2).setCellValue(e.getStage());
                r.createCell(3).setCellValue(e.getExType());
                r.createCell(4).setCellValue(e.getExMessage());
                r.createCell(5).setCellValue(e.getJenkinsNode());
                r.createCell(6).setCellValue(e.getCreatedAt().toString());
                r.createCell(7).setCellValue(e.getIsRead() ? "Да" : "Нет");
            }
        }
        // Автоширина
        for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
    }
}