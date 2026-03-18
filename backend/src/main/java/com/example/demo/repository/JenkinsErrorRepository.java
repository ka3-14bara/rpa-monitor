package com.example.demo.repository;

import com.example.demo.entity.JenkinsError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface JenkinsErrorRepository extends JpaRepository<JenkinsError, Long> {

    List<JenkinsError> findByProjectNumber(String projectNumber);

    List<JenkinsError> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<JenkinsError> findByProjectNumberAndCreatedAtBetween(
            String projectNumber,
            LocalDateTime from,
            LocalDateTime to);

    @Modifying
    @Transactional
    @Query("UPDATE JenkinsError e SET e.isRead = true WHERE e.projectNumber = :projectNumber")
    void markAllAsReadByProject(String projectNumber);
}