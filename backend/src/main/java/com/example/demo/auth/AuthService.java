package com.example.demo.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.entity.RefreshToken;
import com.example.demo.dto.AuthResponseDto;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.entity.User;
import com.example.demo.repository.RefreshTokenRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshRepo;

    public AuthResponseDto register(AuthRequestDto req) {
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        userRepo.save(user);

        return generateTokens(req.getUsername());
    }

    public AuthResponseDto login(AuthRequestDto req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow();

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        return generateTokens(req.getUsername());
    }

    private AuthResponseDto generateTokens(String username) {
        String access = jwtService.generateToken(username);
        String refresh = UUID.randomUUID().toString();

        RefreshToken token = new RefreshToken();
        token.setToken(refresh);
        token.setUsername(username);
        token.setExpiryDate(LocalDateTime.now().plusDays(7));

        refreshRepo.save(token);

        return new AuthResponseDto(access, refresh);
    }

    public AuthResponseDto refresh(String refreshToken) {
        RefreshToken token = refreshRepo.findByToken(refreshToken)
                .orElseThrow();

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        return generateTokens(token.getUsername());
    }

    public void logout(String username) {
        refreshRepo.deleteByUsername(username);
    }
}
