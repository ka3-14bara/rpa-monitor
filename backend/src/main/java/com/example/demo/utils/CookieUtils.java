package com.example.demo.utils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

import java.util.Arrays;
import java.util.Optional;

public class CookieUtils {

    public static final String ACCESS_TOKEN_COOKIE = "access_token";
    public static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    public static void setAccessTokenCookie(HttpServletResponse response, String token) {
        setCookie(response, ACCESS_TOKEN_COOKIE, token, 86400);
    }

    public static void setRefreshTokenCookie(HttpServletResponse response, String token) {
        setCookie(response, REFRESH_TOKEN_COOKIE, token, 604800);
    }

    public static void clearAccessTokenCookie(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE);
    }

    public static void clearRefreshTokenCookie(HttpServletResponse response) {
        clearCookie(response, REFRESH_TOKEN_COOKIE);
    }

    private static void setCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private static void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public static Optional<String> getAccessTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE);
    }

    public static Optional<String> getRefreshTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_TOKEN_COOKIE);
    }

    private static Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null)
            return Optional.empty();
        return Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}