package com.careerflow.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class XYZRewriteResponseDTO {
    @JsonProperty("original_bullet")
    private String originalBullet;

    @JsonProperty("rewritten_bullet")
    private String rewrittenBullet;

    @JsonProperty("formula_x")
    private String formulaX;

    @JsonProperty("formula_y")
    private String formulaY;

    @JsonProperty("formula_z")
    private String formulaZ;

    @JsonProperty("impact_boost_score")
    private int impactBoostScore;

    @JsonProperty("alternative_variations")
    private List<String> alternativeVariations;

    public XYZRewriteResponseDTO() {}

    public String getOriginalBullet() { return originalBullet; }
    public void setOriginalBullet(String originalBullet) { this.originalBullet = originalBullet; }

    public String getRewrittenBullet() { return rewrittenBullet; }
    public void setRewrittenBullet(String rewrittenBullet) { this.rewrittenBullet = rewrittenBullet; }

    public String getFormulaX() { return formulaX; }
    public void setFormulaX(String formulaX) { this.formulaX = formulaX; }

    public String getFormulaY() { return formulaY; }
    public void setFormulaY(String formulaY) { this.formulaY = formulaY; }

    public String getFormulaZ() { return formulaZ; }
    public void setFormulaZ(String formulaZ) { this.formulaZ = formulaZ; }

    public int getImpactBoostScore() { return impactBoostScore; }
    public void setImpactBoostScore(int impactBoostScore) { this.impactBoostScore = impactBoostScore; }

    public List<String> getAlternativeVariations() { return alternativeVariations; }
    public void setAlternativeVariations(List<String> alternativeVariations) { this.alternativeVariations = alternativeVariations; }
}
