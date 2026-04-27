package com.seaworld.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * API 限流配置
 * 基于 IP 地址限制请求频率，防止滥用
 */
@Slf4j
@Configuration
public class RateLimitConfig {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();

    public RateLimitConfig() {
        // 每分钟清空一次计数器
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleAtFixedRate(requestCounts::clear, 1, 1, TimeUnit.MINUTES);
    }

    @Bean
    public OncePerRequestFilter rateLimitFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {

                String clientIp = getClientIp(request);
                AtomicInteger count = requestCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));

                if (count.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
                    log.warn("Rate limit exceeded for IP: {}", clientIp);
                    response.setStatus(429); // Too Many Requests
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"Rate limit exceeded. Please try again later.\"}");
                    return;
                }

                filterChain.doFilter(request, response);
            }

            private String getClientIp(HttpServletRequest request) {
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("X-Real-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                // 如果有多个 IP（通过多个代理），取第一个
                if (ip != null && ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        };
    }
}
