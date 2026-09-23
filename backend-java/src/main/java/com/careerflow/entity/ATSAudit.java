package com.careerflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ats_audits")
public class ATSAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String candidateName;
    private String targetRole;
    private int atsScore;
    private double matchPercentage;

    @Column(length = 2000)
    private String summary;

    @ElementCollection
    @CollectionTable(name = "ats_matched_keywords", joinColumns = @JoinColumn(name = "audit_id"))
    @Column(name = "keyword")
    private List<String> matchedKeywords = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ats_missing_keywords", joinColumns = @JoinColumn(name = "audit_id"))
    @Column(name = "keyword")
    private List<String> missingKeywords = new ArrayList<>();

    private LocalDateTime scannedAt;

    public ATSAudit() {
        this.scannedAt = LocalDateTime.now();
    }

    public ATSAudit(String candidateName, String targetRole, int atsScore, double matchPercentage, String summary) {
        this();
        this.candidateName = candidateName;
        this.targetRole = targetRole;
        this.atsScore = atsScore;
        this.matchPercentage = matchPercentage;
        this.summary = summary;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public double getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(double matchPercentage) { this.matchPercentage = matchPercentage; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getMatchedKeywords() { return matchedKeywords; }
    public void setMatchedKeywords(List<String> matchedKeywords) { this.matchedKeywords = matchedKeywords; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}
