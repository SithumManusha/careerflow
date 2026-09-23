package com.careerflow.controller;

import com.careerflow.entity.JobPosting;
import com.careerflow.repository.JobPostingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(originPatterns = "*")
@Tag(name = "Job Postings", description = "Endpoints for enterprise job benchmark postings")
public class JobPostingController {

    private final JobPostingRepository jobRepository;

    public JobPostingController(JobPostingRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @GetMapping
    @Operation(summary = "Get all active enterprise job postings")
    public ResponseEntity<List<JobPosting>> getAll() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job posting by ID")
    public ResponseEntity<JobPosting> getById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Publish a new enterprise job posting")
    public ResponseEntity<JobPosting> createJob(@RequestBody JobPosting job) {
        return ResponseEntity.ok(jobRepository.save(job));
    }
}
