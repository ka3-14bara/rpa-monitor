package com.example.demo.service;

import com.example.demo.dto.DashboardDataDto;
import com.example.demo.dto.TimeSeriesPointDto;
import com.example.demo.entity.JenkinsError;
import com.example.demo.entity.RpaError;
import com.example.demo.repository.JenkinsErrorRepository;
import com.example.demo.repository.RpaErrorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final RpaErrorRepository rpaRepo;
    private final JenkinsErrorRepository jenkinsRepo;

    public DashboardDataDto getDashboardData(List<String> projects, LocalDateTime from, LocalDateTime to) {
        // 1. Считаем по проектам
        Map<String, Long> byProject = new HashMap<>();
        rpaRepo.countByProjectInAndDateBetween(projects, from, to)
                .forEach(row -> byProject.merge((String) row[0], (Long) row[1], Long::sum));
        jenkinsRepo.countByProjectInAndDateBetween(projects, from, to)
                .forEach(row -> byProject.merge((String) row[0], (Long) row[1], Long::sum));

        // 2. Считаем по источникам
        long rpaTotal = rpaRepo.countByProjectInAndDateBetween(projects, from, to).stream()
                .mapToLong(row -> (Long) row[1]).sum();
        long jenkinsTotal = jenkinsRepo.countByProjectInAndDateBetween(projects, from, to).stream()
                .mapToLong(row -> (Long) row[1]).sum();

        Map<String, Long> bySource = Map.of("RPA", rpaTotal, "JENKINS", jenkinsTotal);

        // 3. Временной ряд (по дням)
        List<RpaError> rpaList = rpaRepo.findByProjectNumberInAndCreatedAtBetween(projects, from, to);
        List<JenkinsError> jenkinsList = jenkinsRepo.findByProjectNumberInAndCreatedAtBetween(projects, from, to);

        Map<LocalDate, Long> rpaByDay = rpaList.stream()
                .collect(Collectors.groupingBy(e -> e.getCreatedAt().toLocalDate(), Collectors.counting()));
        Map<LocalDate, Long> jenkinsByDay = jenkinsList.stream()
                .collect(Collectors.groupingBy(e -> e.getCreatedAt().toLocalDate(), Collectors.counting()));

        Set<LocalDate> allDays = new TreeSet<>();
        allDays.addAll(rpaByDay.keySet());
        allDays.addAll(jenkinsByDay.keySet());

        List<TimeSeriesPointDto> timeSeries = allDays.stream()
                .map(date -> new TimeSeriesPointDto(
                        date.toString(),
                        rpaByDay.getOrDefault(date, 0L),
                        jenkinsByDay.getOrDefault(date, 0L)))
                .toList();

        return new DashboardDataDto(byProject, bySource, timeSeries, rpaTotal + jenkinsTotal);
    }

    // Геттеры для Excel-сервиса
    public List<RpaError> getRpaErrors(List<String> projects, LocalDateTime from, LocalDateTime to) {
        return rpaRepo.findByProjectNumberInAndCreatedAtBetween(projects, from, to);
    }
    public List<JenkinsError> getJenkinsErrors(List<String> projects, LocalDateTime from, LocalDateTime to) {
        return jenkinsRepo.findByProjectNumberInAndCreatedAtBetween(projects, from, to);
    }
}