package com.careerflow.controller;

import com.careerflow.dto.ProfileRequest;
import com.careerflow.entity.CandidateProfile;
import com.careerflow.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(originPatterns = "*")
@Tag(name = "Candidate Profiles", description = "Endpoints for public candidate profile showcases")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(summary = "Get all registered candidate profiles")
    public ResponseEntity<List<CandidateProfile>> getAll() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    @GetMapping("/{username}")
    @Operation(summary = "Get public profile by username slug")
    public ResponseEntity<CandidateProfile> getByUsername(@PathVariable String username) {
        return profileService.getProfileByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create or update candidate profile")
    public ResponseEntity<CandidateProfile> saveProfile(@RequestBody ProfileRequest req) {
        return ResponseEntity.ok(profileService.saveOrUpdateProfile(req));
    }
}
