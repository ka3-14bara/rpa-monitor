package com.example.demo.controller;

import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.ErrorEventDto;

import com.example.demo.service.ErrorWebSocketService;

import lombok.RequiredArgsConstructor;

// --- для тестов вебсокета ---
@RestController
@RequiredArgsConstructor
@RequestMapping("/ws")
public class WebSocketController {

    private final ErrorWebSocketService service;

    @PostMapping("/test")
    public void test() {
        service.sendError(
                new ErrorEventDto("018", "RPA", "Test error", LocalDateTime.now()));
    }
}