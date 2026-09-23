package com.careerflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_postings")
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String roleTitle;

    @Column(length = 5000, nullable = false)
    private String description;

    private String location;
    private String jobType; // Full-time, Internship, Remote

    @ElementCollection
    @CollectionTable(name = "job_required_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    private LocalDateTime postedAt;

    public JobPosting() {
        this.postedAt = LocalDateTime.now();
    }

    public JobPosting(String companyName, String roleTitle, String description, String location, String jobType, List<String> requiredSkills) {
        this();
        this.companyName = companyName;
        this.roleTitle = roleTitle;
        this.description = description;
        this.location = location;
        this.jobType = jobType;
        if (requiredSkills != null) {
            this.requiredSkills = requiredSkills;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
}
