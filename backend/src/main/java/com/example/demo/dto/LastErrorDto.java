package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LastErrorDto {

    private String projectNumber;
    private String source; // RPA или JENKINS
    private String stage;
    private String message;
    private LocalDateTime createdAt;
    private Number messageId;
    private Boolean isRead;
}