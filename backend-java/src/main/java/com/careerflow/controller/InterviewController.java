package com.careerflow.controller;

import com.careerflow.service.PythonWorkerClientService;
import com.careerflow.service.RateLimiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(originPatterns = "*")
@Tag(name = "AI Mock Interview Simulator", description = "Endpoints for generating role-based technical/behavioral interview questions and evaluating candidate answers")
public class InterviewController {

    private final PythonWorkerClientService pythonWorkerClient;
    private final RateLimiterService rateLimiterService;

    public InterviewController(PythonWorkerClientService pythonWorkerClient, RateLimiterService rateLimiterService) {
        this.pythonWorkerClient = pythonWorkerClient;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/generate-questions")
    @Operation(summary = "Generate 5 tailored technical & behavioral interview questions")
    public ResponseEntity<?> generateQuestions(@RequestBody Map<String, Object> request, HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr() != null ? servletRequest.getRemoteAddr() : "default-client";
        if (!rateLimiterService.tryConsume(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Please wait before generating more questions."));
        }
        return ResponseEntity.ok(pythonWorkerClient.generateInterviewQuestions(request));
    }

    @PostMapping("/evaluate-answer")
    @Operation(summary = "Evaluate candidate interview response with score, model answer, and follow-up")
    public ResponseEntity<?> evaluateAnswer(@RequestBody Map<String, Object> request, HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr() != null ? servletRequest.getRemoteAddr() : "default-client";
        if (!rateLimiterService.tryConsume(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Please wait before evaluating another answer."));
        }
        return ResponseEntity.ok(pythonWorkerClient.evaluateInterviewAnswer(request));
    }
}
