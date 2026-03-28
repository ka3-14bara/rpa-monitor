package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.RpaError;

public interface DashboardRepository extends JpaRepository<RpaError, Long> {

    @Query(value = """
            SELECT DISTINCT ON (project_number)
                project_number,
                source,
                stage,
                ex_message as message,
                created_at
            FROM (
                SELECT
                    project_number,
                    'RPA' as source,
                    stage,
                    ex_message,
                    created_at
                FROM rpa_errors

                UNION ALL

                SELECT
                    project_number,
                    'JENKINS' as source,
                    stage,
                    ex_message,
                    created_at
                FROM jenkins_errors
            ) combined
            WHERE project_number IN (:projects)
            ORDER BY project_number, created_at DESC
            """, nativeQuery = true)
    List<Object[]> findLastErrorsByProjects(List<String> projects);
}