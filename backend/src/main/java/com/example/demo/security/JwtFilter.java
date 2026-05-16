package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.annotation.Nonnull; // Добавлено для устранения предупреждений
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.example.demo.utils.CookieUtils;

import java.io.IOException;
import java.util.Collections; // Изменено с java.util.List
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        CookieUtils.getAccessTokenFromCookies(request).ifPresent(token -> {
            try {
                String username = jwtService.extractUsername(token);
                String role = jwtService.extractRole(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Изменено для совместимости с Java 8
                    List<SimpleGrantedAuthority> authorities = Collections
                            .singletonList(new SimpleGrantedAuthority(role));

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null,
                            authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                log.warn("Invalid JWT token: {}", e.getMessage());
            }
        });

        filterChain.doFilter(request, response);
    }
}
