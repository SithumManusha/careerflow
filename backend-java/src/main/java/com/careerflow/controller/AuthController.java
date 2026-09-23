package com.careerflow.controller;

import com.careerflow.dto.AuthRequest;
import com.careerflow.dto.AuthResponse;
import com.careerflow.entity.UserAccount;
import com.careerflow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration, login, and session validation")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user account")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserAccount user = authService.validateTokenAndGetUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or session expired"));
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "createdAt", user.getCreatedAt()
        ));
    }
}
