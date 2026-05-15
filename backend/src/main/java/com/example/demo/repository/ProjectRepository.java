package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.RpaError;

public interface ProjectRepository extends JpaRepository<RpaError, Long> {

    @Query(value = """
        SELECT project_number FROM rpa_errors WHERE project_number IS NOT NULL
        UNION
        SELECT project_number FROM jenkins_errors WHERE project_number IS NOT NULL
        """, nativeQuery = true)
    List<String> findAllProjects();
}
