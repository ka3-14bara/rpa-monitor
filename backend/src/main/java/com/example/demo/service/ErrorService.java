package com.example.demo.service;

import com.example.demo.dto.LastErrorDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class ErrorService {

    private final RpaErrorRepository rpaRepo;
    private final JenkinsErrorRepository jenkinsRepo;
    private final ProjectRepository projectRepo;
    private final UserProjectRepository userProjectRepo;
    private final DashboardRepository dashboardRepo;

    public ErrorService(
            RpaErrorRepository rpaRepo,
            JenkinsErrorRepository jenkinsRepo,
            ProjectRepository projectRepo,
            UserProjectRepository userProjectRepo,
            DashboardRepository dashboardRepo) {
        this.rpaRepo = rpaRepo;
        this.jenkinsRepo = jenkinsRepo;
        this.projectRepo = projectRepo;
        this.userProjectRepo = userProjectRepo;
        this.dashboardRepo = dashboardRepo;
    }

    // одно сообщение
    public void markRpaAsRead(Long id) {
        RpaError error = rpaRepo.findById(id).orElseThrow();
        error.setIsRead(true);
        rpaRepo.save(error);
    }

    public void markJenkinsAsRead(Long id) {
        JenkinsError error = jenkinsRepo.findById(id).orElseThrow();
        error.setIsRead(true);
        jenkinsRepo.save(error);
    }

    // все по проекту
    public void markAllRpaByProject(String project) {
        rpaRepo.markAllAsReadByProject(project);
    }

    public void markAllJenkinsByProject(String project) {
        jenkinsRepo.markAllAsReadByProject(project);
    }

    public Page<RpaError> getRpaErrors(
            String project,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        if (project != null && from != null && to != null) {
            return rpaRepo.findByProjectNumberAndCreatedAtBetween(
                    project, from, to, pageable);
        }

        if (project != null) {
            return rpaRepo.findByProjectNumber(project, pageable);
        }

        if (from != null && to != null) {
            return rpaRepo.findByCreatedAtBetween(from, to, pageable);
        }

        return rpaRepo.findAll(pageable);
    }

    public Page<JenkinsError> getJenkinsErrors(
            String project,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        if (project != null && from != null && to != null) {
            return jenkinsRepo.findByProjectNumberAndCreatedAtBetween(
                    project, from, to, pageable);
        }

        if (project != null) {
            return jenkinsRepo.findByProjectNumber(project, pageable);
        }

        if (from != null && to != null) {
            return jenkinsRepo.findByCreatedAtBetween(from, to, pageable);
        }

        return jenkinsRepo.findAll(pageable);
    }

    public List<String> getAllProjects() {
        return projectRepo.findAllProjects();
    }

    @Transactional
    public void saveUserProjects(String username, List<String> projects) {
        userProjectRepo.deleteByUsername(username);

        List<UserProject> list = projects.stream()
                .map(p -> {
                    UserProject up = new UserProject();
                    up.setUsername(username);
                    up.setProjectNumber(p);
                    return up;
                })
                .toList();

        userProjectRepo.saveAll(list);
    }

    public List<String> getUserProjects(String username) {
        return userProjectRepo.findByUsername(username)
                .stream()
                .map(UserProject::getProjectNumber)
                .toList();
    }

    public List<LastErrorDto> getLastErrorsForUserProjects(String username) {

        List<String> projects = userProjectRepo.findByUsername(username)
                .stream()
                .map(UserProject::getProjectNumber)
                .toList();

        List<Object[]> rows = dashboardRepo.findLastErrorsByProjects(projects);

        return rows.stream()
                .map(r -> new LastErrorDto(
                        (String) r[0],
                        (String) r[1],
                        (String) r[2],
                        (String) r[3],
                        ((Timestamp) r[4]).toLocalDateTime(),
                        (Number) r[5],
                        (Boolean) r[6]))
                .toList();
    }
}