package com.careerflow.controller;

import com.careerflow.dto.ATSScanRequestDTO;
import com.careerflow.dto.ATSScanResponseDTO;
import com.careerflow.dto.XYZRewriteRequestDTO;
import com.careerflow.dto.XYZRewriteResponseDTO;
import com.careerflow.entity.ATSAudit;
import com.careerflow.repository.ATSAuditRepository;
import com.careerflow.service.PythonWorkerClientService;
import com.careerflow.service.RateLimiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats")
@CrossOrigin(originPatterns = "*")
@Tag(name = "ATS Optimization Engine", description = "Endpoints for resume scanning, scoring, and XYZ bullet optimization")
public class ATSController {

    private final PythonWorkerClientService pythonWorkerClient;
    private final RateLimiterService rateLimiterService;
    private final ATSAuditRepository auditRepository;

    public ATSController(
            PythonWorkerClientService pythonWorkerClient,
            RateLimiterService rateLimiterService,
            ATSAuditRepository auditRepository
    ) {
        this.pythonWorkerClient = pythonWorkerClient;
        this.rateLimiterService = rateLimiterService;
        this.auditRepository = auditRepository;
    }

    @PostMapping("/scan")
    @Operation(summary = "Perform ATS compatibility scan against Job Description with Token-Bucket Rate Limiting")
    public ResponseEntity<?> scanResume(
            @RequestBody ATSScanRequestDTO request,
            HttpServletRequest servletRequest
    ) {
        // Resolve client IP or identifier
        String clientIp = servletRequest.getRemoteAddr();
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "default-client";
        }

        // Token-bucket rate limiting check (10 requests/minute)
        if (!rateLimiterService.tryConsume(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit exceeded (10 scans/minute). Please wait before scanning again.");
        }

        ATSScanResponseDTO response = pythonWorkerClient.scanATS(request);

        // Persist audit record
        try {
            ATSAudit audit = new ATSAudit(
                    response.getCandidateName(),
                    response.getTargetRole(),
                    response.getAtsScore(),
                    response.getMatchPercentage(),
                    response.getSummary()
            );
            if (response.getMatchedKeywords() != null) {
                audit.setMatchedKeywords(response.getMatchedKeywords());
            }
            if (response.getMissingKeywords() != null) {
                audit.setMissingKeywords(response.getMissingKeywords());
            }
            auditRepository.save(audit);
        } catch (Exception ex) {
            // Non-blocking audit persistence failure
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/rewrite-xyz")
    @Operation(summary = "Transform weak bullet points into Google XYZ format")
    public ResponseEntity<XYZRewriteResponseDTO> rewriteBullet(@RequestBody XYZRewriteRequestDTO request) {
        XYZRewriteResponseDTO response = pythonWorkerClient.rewriteXYZ(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @Operation(summary = "Fetch recent ATS scans audit history")
    public ResponseEntity<List<ATSAudit>> getHistory() {
        return ResponseEntity.ok(auditRepository.findTop10ByOrderByScannedAtDesc());
    }
}
