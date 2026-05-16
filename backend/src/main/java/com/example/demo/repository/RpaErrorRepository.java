package com.example.demo.repository;

import com.example.demo.entity.RpaError;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RpaErrorRepository extends JpaRepository<RpaError, Long> {

    Optional<RpaError> findTopByProjectNumberOrderByCreatedAtDesc(String projectNumber);

    // Переопределяем findAll, чтобы исключить удалённые записи
    @Override
    @Query("SELECT e FROM RpaError e WHERE e.isDeleted = false")
    Page<RpaError> findAll(Pageable pageable);

    @Query("SELECT e FROM RpaError e WHERE e.projectNumber = :project AND e.isDeleted = false")
    Page<RpaError> findByProjectNumber(String project, Pageable pageable);

    @Query("SELECT e FROM RpaError e WHERE e.createdAt BETWEEN :from AND :to AND e.isDeleted = false")
    Page<RpaError> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

    @Query("SELECT e FROM RpaError e WHERE e.projectNumber = :project AND e.createdAt BETWEEN :from AND :to AND e.isDeleted = false")
    Page<RpaError> findByProjectNumberAndCreatedAtBetween(String project, LocalDateTime from, LocalDateTime to,
            Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE RpaError e SET e.isRead = true WHERE e.projectNumber = :projectNumber AND e.isDeleted = false")
    void markAllAsReadByProject(String projectNumber);

    @Query("SELECT e.projectNumber, COUNT(e) FROM RpaError e WHERE e.projectNumber IN :projects AND e.createdAt BETWEEN :from AND :to AND e.isDeleted = false GROUP BY e.projectNumber")
    List<Object[]> countByProjectInAndDateBetween(List<String> projects, LocalDateTime from, LocalDateTime to);

    @Query("SELECT e FROM RpaError e WHERE e.projectNumber IN :projects AND e.createdAt BETWEEN :from AND :to AND e.isDeleted = false")
    List<RpaError> findByProjectNumberInAndCreatedAtBetween(List<String> projects, LocalDateTime from,
            LocalDateTime to);

    // Soft delete
    @Modifying
    @Transactional
    @Query("UPDATE RpaError e SET e.isDeleted = true WHERE e.id = :id")
    void softDeleteById(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE RpaError e SET e.isDeleted = false WHERE e.id = :id")
    void restoreById(Long id);
}