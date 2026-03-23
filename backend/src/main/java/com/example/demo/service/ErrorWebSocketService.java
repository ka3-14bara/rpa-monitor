package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ErrorEventDto;

@Service
@RequiredArgsConstructor
public class ErrorWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendError(ErrorEventDto dto) {
        messagingTemplate.convertAndSend("/topic/errors", dto);
    }
}