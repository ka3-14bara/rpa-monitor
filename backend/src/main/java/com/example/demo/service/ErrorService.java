package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ErrorService {

    private final RpaErrorRepository rpaRepo;
    private final JenkinsErrorRepository jenkinsRepo;

    public ErrorService(RpaErrorRepository rpaRepo, JenkinsErrorRepository jenkinsRepo) {
        this.rpaRepo = rpaRepo;
        this.jenkinsRepo = jenkinsRepo;
    }

    public List<RpaError> getRpaErrors(String project, LocalDateTime from, LocalDateTime to) {

        if (project != null && from != null && to != null) {
            return rpaRepo.findByProjectNumberAndCreatedAtBetween(project, from, to);
        }

        if (project != null) {
            return rpaRepo.findByProjectNumber(project);
        }

        if (from != null && to != null) {
            return rpaRepo.findByCreatedAtBetween(from, to);
        }

        return rpaRepo.findAll();
    }

    public List<JenkinsError> getJenkinsErrors(String project, LocalDateTime from, LocalDateTime to) {

        if (project != null && from != null && to != null) {
            return jenkinsRepo.findByProjectNumberAndCreatedAtBetween(project, from, to);
        }

        if (project != null) {
            return jenkinsRepo.findByProjectNumber(project);
        }

        if (from != null && to != null) {
            return jenkinsRepo.findByCreatedAtBetween(from, to);
        }

        return jenkinsRepo.findAll();
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
}