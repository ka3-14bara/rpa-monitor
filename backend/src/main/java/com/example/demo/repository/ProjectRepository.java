package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.RpaError;

public interface ProjectRepository extends JpaRepository<RpaError, Long> {

    @Query("SELECT DISTINCT e.projectNumber FROM RpaError e")
    List<String> findAllProjects();
}
