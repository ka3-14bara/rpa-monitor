package com.example.demo.controller;

import com.example.demo.dto.ErrorEventDto;
import com.example.demo.dto.LastErrorDto;
import com.example.demo.entity.*;
import com.example.demo.service.ErrorService;
import com.example.demo.service.ErrorWebSocketService;

import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/errors")
public class ErrorController {

    private final ErrorService service;
    private final ErrorWebSocketService errorWebSocketService;

    public ErrorController(ErrorService service, ErrorWebSocketService errorWebSocketService) {
        this.service = service;
        this.errorWebSocketService = errorWebSocketService;
    }

    // --- RPA ---
    @GetMapping("/rpa")
    public Page<RpaError> getRpaErrors(
            @RequestParam(required = false) String project,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Pageable pageable) {
        return service.getRpaErrors(
                project,
                parseDate(from),
                parseDate(to),
                pageable);
    }

    // --- Jenkins ---
    @GetMapping("/jenkins")
    public Page<JenkinsError> getJenkinsErrors(
            @RequestParam(required = false) String project,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Pageable pageable) {
        return service.getJenkinsErrors(
                project,
                parseDate(from),
                parseDate(to),
                pageable);
    }

    // --- Projects ---
    @GetMapping("/projects")
    public List<String> getProjects() {
        return service.getAllProjects();
    }

    // --- user's projects ---
    @GetMapping("/user/projects")
    public List<String> getUserProjects(Authentication auth) {
        return service.getUserProjects(auth.getName());
    }

    private LocalDateTime parseDate(String date) {
        if (date == null)
            return null;
        return LocalDateTime.parse(date);
    }

    // --- user's last errors ---
    @GetMapping("/user/last-errors")
    public List<LastErrorDto> getLastErrors(Authentication auth) {
        return service.getLastErrorsForUserProjects(auth.getName());
    }

    // отметить одно сообщение
    @PostMapping("/rpa/{id}/read")
    public void markRpaRead(@PathVariable Long id) {
        service.markRpaAsRead(id);
    }

    @PostMapping("/jenkins/{id}/read")
    public void markJenkinsRead(@PathVariable Long id) {
        service.markJenkinsAsRead(id);
    }

    // отметить все по проекту

    @PostMapping("/rpa/project/{project}/read-all")
    public void markAllRpa(@PathVariable String project) {
        service.markAllRpaByProject(project);
    }

    @PostMapping("/jenkins/project/{project}/read-all")
    public void markAllJenkins(@PathVariable String project) {
        service.markAllJenkinsByProject(project);
    }

    // --- save user's projects ---
    @PostMapping("/user/projects")
    public void saveProjects(
            @RequestBody List<String> projects,
            Authentication auth) {
        service.saveUserProjects(auth.getName(), projects);
    }

    // --- для питон бота при создании ошибки ---
    @PostMapping("/notify")
    public void notifyError(@RequestBody ErrorEventDto dto) {
        errorWebSocketService.sendError(dto);
    }
}