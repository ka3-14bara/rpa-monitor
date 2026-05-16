package com.example.demo.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import java.util.Collections;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.AuthRequestDto;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody AuthRequestDto req, HttpServletResponse response) {
        authService.register(req, response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody AuthRequestDto req, HttpServletResponse response) {
        authService.login(req, response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        authService.refresh(request, response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication auth, HttpServletResponse response) {
        authService.logout(auth.getName(), response);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public Map<String, String> getCurrentUser(Authentication auth) {
        return Collections.singletonMap("username", auth.getName());
    }

}