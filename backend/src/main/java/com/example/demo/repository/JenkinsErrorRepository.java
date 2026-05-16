package com.example.demo.repository;

import com.example.demo.entity.JenkinsError;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface JenkinsErrorRepository extends JpaRepository<JenkinsError, Long> {

    Optional<JenkinsError> findTopByProjectNumberOrderByCreatedAtDesc(String projectNumber);

    // Переопределяем findAll, чтобы исключить удалённые записи
    @Override
    @Query("SELECT e FROM JenkinsError e WHERE e.isDeleted = false")
    Page<JenkinsError> findAll(Pageable pageable);

    @Query("SELECT e FROM JenkinsError e WHERE e.projectNumber = :project AND e.isDeleted = false")
    Page<JenkinsError> findByProjectNumber(String project, Pageable pageable);

    @Query("SELECT e FROM JenkinsError e WHERE e.createdAt BETWEEN :from AND :to AND e.isDeleted = false")
    Page<JenkinsError> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

    @Query("SELECT e FROM JenkinsError e WHERE e.projectNumber = :project AND e.createdAt BETWEEN :from AND :to AND e.isDeleted = false")
    Page<JenkinsError> findByProjectNumberAndCreatedAtBetween(String project, LocalDateTime from, LocalDateTime to,
            Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE JenkinsError e SET e.isRead = true WHERE e.projectNumber = :projectNumber AND e.isDeleted = false")
    void markAllAsReadByProject(String projectNumber);

    @Query("SELECT e.projectNumber, COUNT(e) FROM JenkinsError e WHERE e.projectNumber IN :projects AND e.createdAt BETWEEN :from AND :to AND e.isDeleted = false GROUP BY e.projectNumber")
    List<Object[]> countByProjectInAndDateBetween(List<String> projects, LocalDateTime from, LocalDateTime to);

    @Query("SELECT e FROM JenkinsError e WHERE e.projectNumber IN :projects AND e.createdAt BETWEEN :from AND :to AND e.isDeleted = false")
    List<JenkinsError> findByProjectNumberInAndCreatedAtBetween(List<String> projects, LocalDateTime from,
            LocalDateTime to);

    // Soft delete
    @Modifying
    @Transactional
    @Query("UPDATE JenkinsError e SET e.isDeleted = true WHERE e.id = :id")
    void softDeleteById(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE JenkinsError e SET e.isDeleted = false WHERE e.id = :id")
    void restoreById(Long id);
}