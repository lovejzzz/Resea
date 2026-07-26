import { describe, expect, it } from "vitest";
import { alignmentMetrics, auditSummary, runAudit } from "../lib/audit";
import { cloneSample } from "../lib/project";

describe("deterministic academic audit", () => {
  it("accepts the sample through critical publication gates", () => {
    const project = cloneSample();
    const findings = runAudit(project);
    expect(auditSummary(findings).critical).toBe(0);
    expect(auditSummary(findings).canPublish).toBe(true);
    expect(alignmentMetrics(project)).toEqual({
      assessmentCoverage: 100,
      practiceCoverage: 100,
      orphanAssessments: 0,
    });
  });

  it("blocks an outcome without an assessment", () => {
    const project = cloneSample();
    project.modules = project.modules.map((module) => ({
      ...module,
      assessments: module.assessments.map((assessment) => ({
        ...assessment,
        outcomeIds: assessment.outcomeIds.filter((id) => id !== "outcome-4"),
      })),
    }));
    const findings = runAudit(project);
    expect(findings.some((item) => item.ruleId === "ALN-001" && item.severity === "critical")).toBe(true);
    expect(auditSummary(findings).canPublish).toBe(false);
  });

  it("detects a prerequisite cycle", () => {
    const project = cloneSample();
    project.concepts[0].prerequisiteIds = ["concept-5"];
    const findings = runAudit(project);
    expect(findings.some((item) => item.ruleId === "SEQ-001")).toBe(true);
  });

  it("blocks high-stakes publication without expert review", () => {
    const project = cloneSample();
    project.spec.riskTier = "high_stakes";
    const findings = runAudit(project);
    expect(findings.some((item) => item.ruleId === "ASM-002" && item.checkerType === "human")).toBe(true);
  });
});
