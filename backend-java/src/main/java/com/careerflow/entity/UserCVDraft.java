package com.careerflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_cv_drafts")
public class UserCVDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String draftTitle;

    private String targetRole;

    @Column(columnDefinition = "TEXT")
    private String resumeDataJson;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserCVDraft() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UserCVDraft(Long userId, String draftTitle, String targetRole, String resumeDataJson) {
        this();
        this.userId = userId;
        this.draftTitle = draftTitle;
        this.targetRole = targetRole;
        this.resumeDataJson = resumeDataJson;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getDraftTitle() { return draftTitle; }
    public void setDraftTitle(String draftTitle) { this.draftTitle = draftTitle; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getResumeDataJson() { return resumeDataJson; }
    public void setResumeDataJson(String resumeDataJson) { this.resumeDataJson = resumeDataJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
