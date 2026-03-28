package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.UserProject;

public interface UserProjectRepository extends JpaRepository<UserProject, Long> {
    List<UserProject> findByUsername(String username);

    void deleteByUsername(String username);
}
