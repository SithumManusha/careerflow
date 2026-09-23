package com.careerflow.dto;

import java.util.List;

public class ATSScanRequestDTO {
    private String resumeText;
    private String jobDescription;
    private String candidateName;
    private String targetRole;

    public ATSScanRequestDTO() {}

    public ATSScanRequestDTO(String resumeText, String jobDescription, String candidateName, String targetRole) {
        this.resumeText = resumeText;
        this.jobDescription = jobDescription;
        this.candidateName = candidateName;
        this.targetRole = targetRole;
    }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
}
