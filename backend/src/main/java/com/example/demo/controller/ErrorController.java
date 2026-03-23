package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.service.ErrorService;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/errors")
public class ErrorController {

    private final ErrorService service;

    public ErrorController(ErrorService service) {
        this.service = service;
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

    private LocalDateTime parseDate(String date) {
        if (date == null)
            return null;
        return LocalDateTime.parse(date);
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
}