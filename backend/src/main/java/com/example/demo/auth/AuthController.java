package com.example.demo.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;

import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponseDto register(@RequestBody AuthRequestDto req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@RequestBody AuthRequestDto req) {
        return authService.login(req);
    }

    @PostMapping("/refresh")
    public AuthResponseDto refresh(@RequestParam String refreshToken) {
        return authService.refresh(refreshToken);
    }

    @PostMapping("/logout")
    public void logout(Authentication auth) {
        authService.logout(auth.getName());
    }
}
