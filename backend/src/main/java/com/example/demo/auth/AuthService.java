package com.example.demo.auth;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.entity.RefreshToken;
import com.example.demo.entity.User;
import com.example.demo.repository.RefreshTokenRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.security.JwtService;
import com.example.demo.utils.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshRepo;

    public void register(AuthRequestDto req, HttpServletResponse response) {
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole("ROLE_USER");
        userRepo.save(user);
        generateAndSetTokens(req.getUsername(), response);
    }

    public void login(AuthRequestDto req, HttpServletResponse response) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }
        generateAndSetTokens(req.getUsername(), response);
    }

    @Transactional
    private void generateAndSetTokens(String username, HttpServletResponse response) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.generateToken(username, user.getRole());
        String refreshToken = UUID.randomUUID().toString();

        RefreshToken token = new RefreshToken();
        token.setToken(refreshToken);
        token.setUsername(username);
        token.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshRepo.save(token);

        CookieUtils.setAccessTokenCookie(response, accessToken);
        CookieUtils.setRefreshTokenCookie(response, refreshToken);
    }

    @Transactional
    public void refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = CookieUtils.getRefreshTokenFromCookies(request)
                .orElseThrow(() -> new RuntimeException("Refresh token missing"));
        RefreshToken token = refreshRepo.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }
        refreshRepo.deleteByUsername(token.getUsername()); // теперь в транзакции
        generateAndSetTokens(token.getUsername(), response);
    }

    @Transactional
    public void logout(String username, HttpServletResponse response) {
        refreshRepo.deleteByUsername(username);
        CookieUtils.clearAccessTokenCookie(response);
        CookieUtils.clearRefreshTokenCookie(response);
    }
}