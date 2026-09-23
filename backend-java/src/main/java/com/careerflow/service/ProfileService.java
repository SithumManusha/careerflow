package com.careerflow.service;

import com.careerflow.dto.ProfileRequest;
import com.careerflow.entity.CandidateProfile;
import com.careerflow.repository.CandidateProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

    private final CandidateProfileRepository profileRepository;

    public ProfileService(CandidateProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public List<CandidateProfile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Optional<CandidateProfile> getProfileByUsername(String username) {
        return profileRepository.findByUsername(username.toLowerCase());
    }

    public CandidateProfile saveOrUpdateProfile(ProfileRequest req) {
        String username = req.getUsername().toLowerCase();
        CandidateProfile profile = profileRepository.findByUsername(username)
                .orElse(new CandidateProfile());

        profile.setUsername(username);
        profile.setFullName(req.getFullName());
        profile.setTitle(req.getTitle());
        profile.setBio(req.getBio());
        profile.setEmail(req.getEmail());
        profile.setPhone(req.getPhone());
        profile.setGithubUrl(req.getGithubUrl());
        profile.setLinkedinUrl(req.getLinkedinUrl());
        profile.setPortfolioUrl(req.getPortfolioUrl());
        if (req.getSkills() != null) {
            profile.setSkills(req.getSkills());
        }
        profile.setExperienceSummary(req.getExperienceSummary());
        profile.setUpdatedAt(LocalDateTime.now());

        return profileRepository.save(profile);
    }
}
