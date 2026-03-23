package com.example.demo.repository;

import com.example.demo.entity.JenkinsError;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface JenkinsErrorRepository extends JpaRepository<JenkinsError, Long> {

    Page<JenkinsError> findByProjectNumber(String project, Pageable pageable);

    Page<JenkinsError> findByCreatedAtBetween(
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable);

    Page<JenkinsError> findByProjectNumberAndCreatedAtBetween(
            String project,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE JenkinsError e SET e.isRead = true WHERE e.projectNumber = :projectNumber")
    void markAllAsReadByProject(String projectNumber);
}