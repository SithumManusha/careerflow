package com.careerflow.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class ATSScanResponseDTO {

    @JsonProperty("ats_score")
    private int atsScore;

    @JsonProperty("match_percentage")
    private double matchPercentage;

    @JsonProperty("semantic_similarity")
    private double semanticSimilarity;

    @JsonProperty("candidate_name")
    private String candidateName;

    @JsonProperty("target_role")
    private String targetRole;

    private String summary;

    @JsonProperty("matched_keywords")
    private List<String> matchedKeywords;

    @JsonProperty("missing_keywords")
    private List<String> missingKeywords;

    @JsonProperty("critical_missing")
    private List<String> criticalMissing;

    @JsonProperty("actionable_recommendations")
    private List<String> actionableRecommendations;

    public ATSScanResponseDTO() {}

    // Getters and Setters
    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public double getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(double matchPercentage) { this.matchPercentage = matchPercentage; }

    public double getSemanticSimilarity() { return semanticSimilarity; }
    public void setSemanticSimilarity(double semanticSimilarity) { this.semanticSimilarity = semanticSimilarity; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getMatchedKeywords() { return matchedKeywords; }
    public void setMatchedKeywords(List<String> matchedKeywords) { this.matchedKeywords = matchedKeywords; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public List<String> getCriticalMissing() { return criticalMissing; }
    public void setCriticalMissing(List<String> criticalMissing) { this.criticalMissing = criticalMissing; }

    public List<String> getActionableRecommendations() { return actionableRecommendations; }
    public void setActionableRecommendations(List<String> actionableRecommendations) { this.actionableRecommendations = actionableRecommendations; }
}
