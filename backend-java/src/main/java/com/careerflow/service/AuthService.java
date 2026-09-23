package com.careerflow.service;

import com.careerflow.dto.AuthRequest;
import com.careerflow.dto.AuthResponse;
import com.careerflow.entity.UserAccount;
import com.careerflow.entity.UserCVDraft;
import com.careerflow.entity.UserScanRecord;
import com.careerflow.repository.UserAccountRepository;
import com.careerflow.repository.UserCVDraftRepository;
import com.careerflow.repository.UserScanRecordRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final UserScanRecordRepository scanRecordRepository;
    private final UserCVDraftRepository cvDraftRepository;

    // Token -> UserAccount mapping (thread-safe session token store)
    private final Map<String, Long> sessionTokens = new ConcurrentHashMap<>();

    public AuthService(UserAccountRepository userAccountRepository,
                       UserScanRecordRepository scanRecordRepository,
                       UserCVDraftRepository cvDraftRepository) {
        this.userAccountRepository = userAccountRepository;
        this.scanRecordRepository = scanRecordRepository;
        this.cvDraftRepository = cvDraftRepository;
    }

    @PostConstruct
    public void seedDemoUser() {
        if (!userAccountRepository.existsByEmail("demo@careerflow.dev")) {
            String salt = generateSalt();
            String hash = hashPassword("demo123", salt);
            UserAccount demoUser = new UserAccount("demo@careerflow.dev", hash, salt, "Demo Engineer (Associate SE)");
            demoUser = userAccountRepository.save(demoUser);

            // Pre-seed 3 scan history records
            scanRecordRepository.save(new UserScanRecord(
                    demoUser.getId(),
                    "Lead Backend Engineer",
                    "Backend Engineer (Java / Cloud)",
                    88,
                    94,
                    "[\"gRPC\", \"Kubernetes\", \"OAuth2\"]"
            ));
            scanRecordRepository.save(new UserScanRecord(
                    demoUser.getId(),
                    "Full-Stack Cloud Developer",
                    "Full-Stack Developer (React / Java)",
                    76,
                    90,
                    "[\"Tailwind CSS\", \"Redis\", \"Docker\"]"
            ));
            scanRecordRepository.save(new UserScanRecord(
                    demoUser.getId(),
                    "Java Microservices Associate",
                    "Backend Engineer (Java / Cloud)",
                    92,
                    96,
                    "[\"GraphQL\", \"Kafka\"]"
            ));

            // Pre-seed sample CV draft
            String sampleDraftJson = "{\"fullName\":\"Demo Software Engineer\",\"email\":\"demo@careerflow.dev\",\"title\":\"Backend & Distributed Systems Engineer\",\"skills\":\"Java 21, Spring Boot 3, Next.js 14, Python, Redis, PostgreSQL, Docker, Kubernetes\"}";
            cvDraftRepository.save(new UserCVDraft(
                    demoUser.getId(),
                    "Backend Cloud Standard 2026",
                    "Backend Engineer (Java / Cloud)",
                    sampleDraftJson
            ));
        }
    }

    public AuthResponse register(AuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        if (userAccountRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String salt = generateSalt();
        String hash = hashPassword(request.getPassword(), salt);
        String name = request.getFullName() != null && !request.getFullName().isBlank() 
                ? request.getFullName().trim() : "Software Engineer Candidate";

        UserAccount user = new UserAccount(request.getEmail().toLowerCase().trim(), hash, salt, name);
        user = userAccountRepository.save(user);

        String token = issueToken(user.getId());
        return new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), token, "Registration successful");
    }

    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        Optional<UserAccount> userOpt = userAccountRepository.findByEmail(request.getEmail().toLowerCase().trim());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        UserAccount user = userOpt.get();
        String checkHash = hashPassword(request.getPassword(), user.getSalt());
        if (!checkHash.equals(user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = issueToken(user.getId());
        return new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), token, "Login successful");
    }

    public UserAccount validateTokenAndGetUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        Long userId = sessionTokens.get(token);
        if (userId == null) {
            return null;
        }
        return userAccountRepository.findById(userId).orElse(null);
    }

    private String issueToken(Long userId) {
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(
                (userId + ":" + System.currentTimeMillis() + ":" + generateSalt()).getBytes(StandardCharsets.UTF_8)
        );
        sessionTokens.put(token, userId);
        return token;
    }

    private String generateSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public String hashPassword(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}
