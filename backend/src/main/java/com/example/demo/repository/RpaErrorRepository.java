package com.example.demo.repository;

import com.example.demo.entity.RpaError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface RpaErrorRepository extends JpaRepository<RpaError, Long> {

    List<RpaError> findByProjectNumber(String projectNumber);

    List<RpaError> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<RpaError> findByProjectNumberAndCreatedAtBetween(
            String projectNumber,
            LocalDateTime from,
            LocalDateTime to);

    @Modifying
    @Transactional
    @Query("UPDATE RpaError e SET e.isRead = true WHERE e.projectNumber = :projectNumber")
    void markAllAsReadByProject(String projectNumber);
}