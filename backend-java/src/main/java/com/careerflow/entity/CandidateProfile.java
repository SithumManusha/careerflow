package com.careerflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate_profiles")
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String bio;

    private String email;
    private String phone;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;

    @ElementCollection
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @Column(length = 4000)
    private String experienceSummary;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CandidateProfile() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public CandidateProfile(String username, String fullName, String title, String bio, String email, String githubUrl, String linkedinUrl) {
        this();
        this.username = username;
        this.fullName = fullName;
        this.title = title;
        this.bio = bio;
        this.email = email;
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getExperienceSummary() { return experienceSummary; }
    public void setExperienceSummary(String experienceSummary) { this.experienceSummary = experienceSummary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
