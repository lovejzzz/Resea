import type {
  AuditFinding,
  Concept,
  ProjectState,
  Severity,
} from "./types";

const finding = (
  ruleId: string,
  category: string,
  severity: Severity,
  title: string,
  description: string,
  remediation: string,
  objectIds: string[] = [],
  checkerType: AuditFinding["checkerType"] = "deterministic",
): AuditFinding => ({
  id: `finding-${ruleId}-${objectIds.join("-") || "project"}`,
  ruleId,
  category,
  checkerType,
  severity,
  title,
  description,
  objectIds,
  remediation,
  status: "open",
});

function hasCycle(concepts: Concept[]) {
  const byId = new Map(concepts.map((concept) => [concept.id, concept]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of byId.get(id)?.prerequisiteIds ?? []) {
      if (visit(next)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return concepts.some((concept) => visit(concept.id));
}

export function runAudit(project: ProjectState): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const evidenceIds = new Set(project.evidence.map((item) => item.id));
  const outcomeIds = new Set(project.outcomes.map((item) => item.id));
  const assessments = project.modules.flatMap((module) => module.assessments);
  const activities = project.modules.flatMap((module) => module.activities);
  const assessedOutcomes = new Set(assessments.flatMap((item) => item.outcomeIds));
  const practicedOutcomes = new Set(activities.flatMap((item) => item.outcomeIds));

  for (const claim of project.claims) {
    const missing = claim.supportingEvidenceIds.filter((id) => !evidenceIds.has(id));
    if (missing.length) {
      findings.push(
        finding(
          "CIT-001",
          "Evidence & citations",
          "critical",
          "Claim references missing evidence",
          `“${claim.text}” points to ${missing.length} evidence unit that is not in this project.`,
          "Restore the evidence unit or remove the unsupported reference.",
          [claim.id],
        ),
      );
    } else if (
      claim.type !== "instructor_decision" &&
      claim.inference !== "instructor_assertion" &&
      claim.supportingEvidenceIds.length === 0
    ) {
      findings.push(
        finding(
          "CIT-003",
          "Evidence & citations",
          "high",
          "Substantive claim has no support",
          `“${claim.text}” has no exact evidence attached.`,
          "Attach a bounded evidence excerpt or label the claim as an instructor assertion.",
          [claim.id],
        ),
      );
    }
  }

  for (const outcome of project.outcomes) {
    if (!assessedOutcomes.has(outcome.id)) {
      findings.push(
        finding(
          "ALN-001",
          "Alignment",
          "critical",
          `${outcome.code} has no assessment`,
          `${outcome.action} ${outcome.object} is required, but no task elicits it.`,
          "Map an assessment that directly elicits this capability.",
          [outcome.id],
        ),
      );
    }
    if (!practicedOutcomes.has(outcome.id)) {
      findings.push(
        finding(
          "ALN-003",
          "Alignment",
          "high",
          `${outcome.code} has no supported practice`,
          "Students are assessed without a mapped opportunity to practice and receive feedback.",
          "Add or map a learning activity before the high-stakes assessment.",
          [outcome.id],
        ),
      );
    }
    if (!/^(analyze|apply|assess|build|compare|compose|construct|create|critique|defend|design|develop|evaluate|formulate|interpret|justify|model|produce|select|synthesize|test|write)/i.test(outcome.action)) {
      findings.push(
        finding(
          "OUT-001",
          "Outcomes",
          "medium",
          `${outcome.code} may use an ambiguous action`,
          `“${outcome.action}” may not make the expected performance observable.`,
          "Use a verb that names an assessable performance.",
          [outcome.id],
          "model_assisted",
        ),
      );
    }
  }

  for (const assessment of assessments) {
    const validMappings = assessment.outcomeIds.filter((id) => outcomeIds.has(id));
    if (!validMappings.length) {
      findings.push(
        finding(
          "ALN-002",
          "Alignment",
          "critical",
          `${assessment.title} has no valid outcome`,
          "The assessment cannot be justified against an approved learning outcome.",
          "Map at least one valid outcome or remove the assessment.",
          [assessment.id],
        ),
      );
    }
    if (!assessment.toolPolicy.trim()) {
      findings.push(
        finding(
          "ASM-004",
          "Assessment",
          "medium",
          `${assessment.title} lacks a tool policy`,
          "Students do not have an explicit policy for computational or generative tools.",
          "State permitted assistance, disclosure expectations, and prohibited uses.",
          [assessment.id],
        ),
      );
    }
    if (!assessment.accessibilityAlternatives.length) {
      findings.push(
        finding(
          "A11Y-006",
          "Accessibility",
          "advisory",
          `${assessment.title} needs an access review`,
          "No accessible pathway or equivalent alternative is documented.",
          "Add an alternative that preserves the assessed construct.",
          [assessment.id],
        ),
      );
    }
    const missingCoreBriefFields = [
      !assessment.purpose?.trim() ? "purpose" : "",
      !assessment.expectedEvidence?.length ? "expected evidence" : "",
      !assessment.alignmentRationale?.trim() ? "alignment rationale" : "",
      !assessment.rubricCriteria.length ? "rubric criteria" : "",
    ].filter(Boolean);
    if (missingCoreBriefFields.length) {
      findings.push(
        finding(
          "ASM-005",
          "Assessment",
          "high",
          `${assessment.title} has an incomplete assessment brief`,
          `The learner and evaluator package is missing ${missingCoreBriefFields.join(", ")}.`,
          "Complete the purpose, expected evidence, alignment rationale, and evaluation criteria before learner use.",
          [assessment.id],
        ),
      );
    }
    const missingAdministrationFields = [
      !assessment.feedbackStrategy?.trim() ? "feedback strategy" : "",
      !assessment.collaborationPolicy?.trim() ? "collaboration policy" : "",
      !assessment.sourcePolicy?.trim() ? "source/originality policy" : "",
      !assessment.integrityNotes?.trim() ? "integrity notes" : "",
      assessment.stakes === "summative" && !assessment.evaluatorGuidance?.trim()
        ? "evaluator guidance"
        : "",
    ].filter(Boolean);
    if (missingAdministrationFields.length) {
      findings.push(
        finding(
          "ASM-006",
          "Assessment",
          "medium",
          `${assessment.title} needs administration guidance`,
          `The assessment is missing ${missingAdministrationFields.join(", ")}.`,
          "Document feedback timing, collaboration, source use, integrity risks, and summative evaluator guidance.",
          [assessment.id],
        ),
      );
    }
  }

  if (hasCycle(project.concepts)) {
    findings.push(
      finding(
        "SEQ-001",
        "Concept sequence",
        "critical",
        "Prerequisite cycle detected",
        "At least one required concept depends on itself through the prerequisite graph.",
        "Remove or qualify one edge before sequencing modules.",
        project.concepts.map((concept) => concept.id),
      ),
    );
  }

  for (const concept of project.concepts) {
    if (concept.role === "core" && !concept.outcomeIds.length) {
      findings.push(
        finding(
          "SEQ-004",
          "Concept sequence",
          "medium",
          `${concept.label} has no outcome`,
          "A core concept consumes course time without a stated course capability.",
          "Map the concept to an outcome or change its role.",
          [concept.id],
        ),
      );
    }
  }

  const publishers = new Map<string, number>();
  for (const source of project.sources.filter((item) => item.reviewState === "approved")) {
    publishers.set(source.publisher, (publishers.get(source.publisher) ?? 0) + 1);
    if (source.license === "unknown") {
      findings.push(
        finding(
          "LIC-005",
          "Licensing & access",
          "advisory",
          `${source.title} has an unknown license`,
          "Public access does not establish permission to adapt or redistribute.",
          "Limit use to linking or a legally supportable quotation until rights are confirmed.",
          [source.id],
        ),
      );
    }
    if (new Date(source.nextCheck).getTime() < Date.now()) {
      findings.push(
        finding(
          "CIT-007",
          "Freshness",
          "medium",
          `${source.title} is due for review`,
          `The source passed its ${source.volatility.replace("_", " ")} review interval.`,
          "Recheck source metadata and content before the next publication.",
          [source.id],
        ),
      );
    }
  }
  const approvedSourceCount = [...publishers.values()].reduce((a, b) => a + b, 0);
  const largestPublisherCount = Math.max(0, ...publishers.values());
  if (approvedSourceCount > 2 && largestPublisherCount / approvedSourceCount > 0.5) {
    findings.push(
      finding(
        "CIT-006",
        "Evidence & citations",
        "medium",
        "Source set is concentrated",
        "More than half of approved sources come from one publisher.",
        "Add an independent source or record a reasoned diversity waiver.",
      ),
    );
  }

  const weeklyBudget =
    project.spec.independentMinutesPerWeek +
    project.spec.sessionsPerWeek * project.spec.minutesPerSession;
  for (const courseModule of project.modules) {
    if (!courseModule.sourceIds.length) {
      findings.push(
        finding(
          "MOD-002",
          "Evidence & citations",
          "high",
          `${courseModule.title} has no source coverage`,
          "The module cannot show which research or instructional source supports its required content.",
          "Map at least one reviewed source or explicitly label the module as instructor-authored content requiring evidence review.",
          [courseModule.id],
        ),
      );
    }
    if (courseModule.estimatedStudentMinutes > weeklyBudget * 1.35) {
      findings.push(
        finding(
          "WRK-002",
          "Workload",
          "medium",
          `${courseModule.title} may be a bottleneck`,
          `${courseModule.estimatedStudentMinutes} estimated minutes exceeds 135% of the stated weekly budget (${weeklyBudget} minutes).`,
          "Split the module, reduce required work, or document that it spans multiple weeks.",
          [courseModule.id],
        ),
      );
    }
    if (!courseModule.activities.length && courseModule.outcomeIds.length) {
      findings.push(
        finding(
          "ALN-003",
          "Alignment",
          "high",
          `${courseModule.title} has outcomes but no practice`,
          "The module introduces required capabilities without a supported learning activity.",
          "Add a feedback-bearing practice activity.",
          [courseModule.id],
        ),
      );
    }
  }

  if (
    ["high_stakes", "regulated"].includes(project.spec.riskTier) &&
    !project.events.some((event) => event.action === "Expert review approved")
  ) {
    findings.push(
      finding(
        "ASM-002",
        "Risk & review",
        "critical",
        "Required expert review is missing",
        "High-stakes and regulated courses cannot be published without a named subject-matter reviewer.",
        "Record institutional and subject-matter approval before publication.",
        [project.spec.id],
        "human",
      ),
    );
  }

  return findings;
}

export function auditSummary(findings: AuditFinding[]) {
  const open = findings.filter((item) => item.status === "open");
  return {
    critical: open.filter((item) => item.severity === "critical").length,
    high: open.filter((item) => item.severity === "high").length,
    medium: open.filter((item) => item.severity === "medium").length,
    advisory: open.filter((item) => item.severity === "advisory").length,
    canPublish: !open.some((item) => item.severity === "critical"),
  };
}

export function alignmentMetrics(project: ProjectState) {
  const assessments = project.modules.flatMap((module) => module.assessments);
  const activities = project.modules.flatMap((module) => module.activities);
  const assessed = new Set(assessments.flatMap((item) => item.outcomeIds));
  const practiced = new Set(activities.flatMap((item) => item.outcomeIds));
  const total = project.outcomes.length || 1;
  return {
    assessmentCoverage: Math.round((project.outcomes.filter((o) => assessed.has(o.id)).length / total) * 100),
    practiceCoverage: Math.round((project.outcomes.filter((o) => practiced.has(o.id)).length / total) * 100),
    orphanAssessments: assessments.filter((a) => !a.outcomeIds.length).length,
  };
}
