package com.careerflow.controller;

import com.careerflow.service.RateLimiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(originPatterns = "*")
@Tag(name = "System Health & Diagnostics", description = "Endpoints for monitoring CareerFlow backend health and rate limiter tokens")
public class HealthController {

    private final RateLimiterService rateLimiterService;

    public HealthController(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @GetMapping
    @Operation(summary = "System health check and diagnostic metrics")
    public ResponseEntity<Map<String, Object>> getHealth(HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        int remainingTokens = rateLimiterService.getRemainingTokens(clientIp != null ? clientIp : "default-client");

        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "CareerFlow Enterprise Java Backend",
                "framework", "Spring Boot 3.3.4 (Java 21/24)",
                "timestamp", LocalDateTime.now(),
                "rateLimiter", Map.of(
                        "clientIp", clientIp != null ? clientIp : "unknown",
                        "remainingTokensInWindow", remainingTokens,
                        "windowLimit", 10
                ),
                "memoryUsageMb", Map.of(
                        "used", usedMemory,
                        "total", totalMemory
                )
        ));
    }
}
