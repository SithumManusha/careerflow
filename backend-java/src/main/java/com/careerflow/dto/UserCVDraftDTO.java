package com.careerflow.dto;

import java.time.LocalDateTime;

public class UserCVDraftDTO {
    private Long id;
    private String draftTitle;
    private String targetRole;
    private String resumeDataJson;
    private LocalDateTime updatedAt;

    public UserCVDraftDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDraftTitle() { return draftTitle; }
    public void setDraftTitle(String draftTitle) { this.draftTitle = draftTitle; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getResumeDataJson() { return resumeDataJson; }
    public void setResumeDataJson(String resumeDataJson) { this.resumeDataJson = resumeDataJson; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
