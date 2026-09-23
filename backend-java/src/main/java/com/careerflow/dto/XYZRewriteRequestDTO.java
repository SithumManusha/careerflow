package com.careerflow.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class XYZRewriteRequestDTO {
    @JsonProperty("bullet_point")
    private String bulletPoint;

    @JsonProperty("target_role")
    private String targetRole;

    @JsonProperty("target_skill")
    private String targetSkill;

    public XYZRewriteRequestDTO() {}

    public String getBulletPoint() { return bulletPoint; }
    public void setBulletPoint(String bulletPoint) { this.bulletPoint = bulletPoint; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getTargetSkill() { return targetSkill; }
    public void setTargetSkill(String targetSkill) { this.targetSkill = targetSkill; }
}
