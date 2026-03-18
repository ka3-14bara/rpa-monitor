package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rpa_errors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RpaError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long messageId;

    private String projectNumber;
    private String stage;

    private String exType;

    @Column(columnDefinition = "TEXT")
    private String exMessage;

    private String activityType;
    private String activityName;

    private String computerName;
    private String componentId;

    private String screenResolution;
    private String triesCount;

    private LocalDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead = false;
}