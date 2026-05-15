package com.example.demo.repository;

import com.example.demo.entity.RpaError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import java.util.List;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RpaErrorRepository extends JpaRepository<RpaError, Long> {

    Optional<RpaError> findTopByProjectNumberOrderByCreatedAtDesc(String projectNumber);

    Page<RpaError> findByProjectNumber(String project, Pageable pageable);

    Page<RpaError> findByCreatedAtBetween(
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable);

    Page<RpaError> findByProjectNumberAndCreatedAtBetween(
            String project,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE RpaError e SET e.isRead = true WHERE e.projectNumber = :projectNumber")
    void markAllAsReadByProject(String projectNumber);

    @Query("SELECT e.projectNumber, COUNT(e) FROM RpaError e WHERE e.projectNumber IN :projects AND e.createdAt BETWEEN :from AND :to GROUP BY e.projectNumber")
    List<Object[]> countByProjectInAndDateBetween(List<String> projects, LocalDateTime from, LocalDateTime to);

    @Query("SELECT e FROM RpaError e WHERE e.projectNumber IN :projects AND e.createdAt BETWEEN :from AND :to")
    List<RpaError> findByProjectNumberInAndCreatedAtBetween(List<String> projects, LocalDateTime from, LocalDateTime to);
}