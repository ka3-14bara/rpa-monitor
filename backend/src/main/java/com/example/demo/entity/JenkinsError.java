package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jenkins_errors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JenkinsError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long messageId;

    private String projectNumber;
    private String stage;

    private String exType;

    @Column(columnDefinition = "TEXT")
    private String exMessage;

    private String activityBlock;
    private String jenkinsNode;

    private String screenResolution;

    private LocalDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead = false;
}