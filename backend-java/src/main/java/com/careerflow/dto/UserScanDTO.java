package com.careerflow.dto;

import java.time.LocalDateTime;

public class UserScanDTO {
    private Long id;
    private String jobTitle;
    private String targetRole;
    private int jobMatchScore;
    private int atsHealthScore;
    private String missingKeywordsJson;
    private LocalDateTime scannedAt;

    public UserScanDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public int getJobMatchScore() { return jobMatchScore; }
    public void setJobMatchScore(int jobMatchScore) { this.jobMatchScore = jobMatchScore; }

    public int getAtsHealthScore() { return atsHealthScore; }
    public void setAtsHealthScore(int atsHealthScore) { this.atsHealthScore = atsHealthScore; }

    public String getMissingKeywordsJson() { return missingKeywordsJson; }
    public void setMissingKeywordsJson(String missingKeywordsJson) { this.missingKeywordsJson = missingKeywordsJson; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}
