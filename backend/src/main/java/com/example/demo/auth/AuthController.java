package com.example.demo.auth;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody Map<String, String> req) {
        return authService.register(req.get("username"), req.get("password"));
    }

    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> req) {
        return authService.login(req.get("username"), req.get("password"));
    }
}
