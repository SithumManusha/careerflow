package com.careerflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_scan_records")
public class UserScanRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String jobTitle;
    private String targetRole;
    private int jobMatchScore;
    private int atsHealthScore;

    @Column(length = 2000)
    private String missingKeywordsJson;

    private LocalDateTime scannedAt;

    public UserScanRecord() {
        this.scannedAt = LocalDateTime.now();
    }

    public UserScanRecord(Long userId, String jobTitle, String targetRole, int jobMatchScore, int atsHealthScore, String missingKeywordsJson) {
        this();
        this.userId = userId;
        this.jobTitle = jobTitle;
        this.targetRole = targetRole;
        this.jobMatchScore = jobMatchScore;
        this.atsHealthScore = atsHealthScore;
        this.missingKeywordsJson = missingKeywordsJson;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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
