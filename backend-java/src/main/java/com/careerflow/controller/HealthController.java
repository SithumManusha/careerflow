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

import java.lang.management.ManagementFactory;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*")
@Tag(name = "System Health & Observability", description = "Endpoints for monitoring CareerFlow backend health, rate limiter tokens, and telemetry")
public class HealthController {

    private final RateLimiterService rateLimiterService;
    private final long startTimeMillis = System.currentTimeMillis();

    public HealthController(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @GetMapping("/api/health")
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
                "framework", "Spring Boot 3.3.4 (Java 21)",
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

    @GetMapping("/api/metrics")
    @Operation(summary = "Production observability telemetry and JVM metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;
        long uptimeSeconds = (System.currentTimeMillis() - startTimeMillis) / 1000;
        int activeThreads = ManagementFactory.getThreadMXBean().getThreadCount();

        return ResponseEntity.ok(Map.of(
                "status", "HEALTHY",
                "service", "careerflow-backend-java",
                "uptimeSeconds", uptimeSeconds,
                "jvm", Map.of(
                        "version", System.getProperty("java.version"),
                        "vendor", System.getProperty("java.vendor"),
                        "activeThreads", activeThreads,
                        "availableProcessors", runtime.availableProcessors()
                ),
                "memoryMb", Map.of(
                        "used", usedMemory,
                        "total", totalMemory,
                        "max", runtime.maxMemory() / (1024 * 1024)
                ),
                "concurrencyLimiter", Map.of(
                        "algorithm", "Token Bucket (Lock-free Atomic CAS)",
                        "rateLimitPerMinute", 10
                )
        ));
    }
}
