import { alignmentMetrics, auditSummary, runAudit } from "./audit";
import type { Assessment, AuditFinding, Module, ProjectState, Source } from "./types";
import { csvCell, formatDate } from "./utils";

export const OUTPUT_RENDERER_VERSION = "2.0.0";

export type OutputCheckStatus = "pass" | "review" | "block";

export interface OutputQualityCheck {
  id: string;
  label: string;
  status: OutputCheckStatus;
  detail: string;
}

export interface OutputQualitySummary {
  status: "ready" | "review_required" | "blocked";
  checks: OutputQualityCheck[];
  passed: number;
  review: number;
  blocked: number;
  studentReleaseReady: boolean;
}

const missing = (instruction: string) =>
  `> **Instructor completion required:** ${instruction}`;

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "artifact";

const mdCell = (value: string | number) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", " ");

const outcomeLabel = (project: ProjectState, outcomeId: string) => {
  const outcome = project.outcomes.find((item) => item.id === outcomeId);
  return outcome
    ? `${outcome.code}: ${outcome.action} ${outcome.object}`
    : `Missing outcome (${outcomeId})`;
};

const sourceCitation = (source: Source) => {
  const people = source.authors.length ? `${source.authors.join(", ")}. ` : "";
  const date = source.publishedAt ? ` (${source.publishedAt.slice(0, 4)}).` : ".";
  return `${people}[${source.title}](${source.canonicalUrl})${date} ${source.publisher}.`;
};

const moduleWindow = (project: ProjectState, index: number) => {
  const count = Math.max(1, project.modules.length);
  const start = Math.floor((index * project.spec.weeks) / count) + 1;
  const end = Math.max(start, Math.floor(((index + 1) * project.spec.weeks) / count));
  return { start, end, span: end - start + 1 };
};

const reviewCounts = (findings: AuditFinding[]) => {
  const summary = auditSummary(findings);
  return `${summary.critical} critical, ${summary.high} high, ${summary.medium} medium, ${summary.advisory} advisory`;
};

export function evaluateOutputQuality(
  project: ProjectState,
  asOf: Date | string = new Date(),
): OutputQualitySummary {
  const findings = runAudit(project);
  const summary = auditSummary(findings);
  const assessments = project.modules.flatMap((module) => module.assessments);
  const incompleteAssessments = assessments.filter(
    (assessment) =>
      !assessment.purpose?.trim() ||
      !assessment.expectedEvidence?.length ||
      !assessment.feedbackStrategy?.trim() ||
      !assessment.collaborationPolicy?.trim() ||
      !assessment.sourcePolicy?.trim() ||
      !assessment.alignmentRationale?.trim() ||
      !assessment.rubricCriteria.length ||
      !assessment.toolPolicy.trim() ||
      !assessment.accessibilityAlternatives.length,
  );
  const incompleteModules = project.modules.filter(
    (module) =>
      !module.drivingQuestion?.trim() ||
      !module.outcomeIds.length ||
      !module.conceptIds.length ||
      !module.sourceIds.length ||
      !module.connections?.trim(),
  );
  const asOfTime = new Date(asOf).getTime();
  const dueSources = project.sources.filter(
    (source) => new Date(source.nextCheck).getTime() < asOfTime,
  );
  const policyFields = [
    project.spec.accessibilityStatement,
    project.spec.academicIntegrityPolicy,
    project.spec.communicationPolicy,
  ];
  const checks: OutputQualityCheck[] = [
    {
      id: "brief",
      label: "Approved academic brief",
      status:
        project.spec.reviewState === "approved" &&
        Boolean(project.spec.catalogDescription?.trim()) &&
        Boolean(project.spec.rationale?.trim())
          ? "pass"
          : "block",
      detail:
        project.spec.reviewState === "approved"
          ? "Catalog description and rationale must be complete before learner release."
          : "The course brief has not been approved.",
    },
    {
      id: "structural-audit",
      label: "Critical structural integrity",
      status: summary.critical ? "block" : "pass",
      detail: summary.critical
        ? `${summary.critical} critical audit finding${summary.critical === 1 ? "" : "s"} block publication.`
        : "No broken evidence references, orphan assessments, unassessed outcomes, or prerequisite cycles.",
    },
    {
      id: "high-findings",
      label: "High-severity findings",
      status: summary.high ? "review" : "pass",
      detail: summary.high
        ? `${summary.high} high-severity finding${summary.high === 1 ? "" : "s"} should be resolved before learner use.`
        : "No high-severity design finding remains.",
    },
    {
      id: "assessment-briefs",
      label: "Complete assessment briefs",
      status: incompleteAssessments.length ? "review" : assessments.length ? "pass" : "block",
      detail: incompleteAssessments.length
        ? `${incompleteAssessments.length} assessment${incompleteAssessments.length === 1 ? "" : "s"} lack purpose, expected evidence, feedback, policy, alignment, rubric, or access metadata.`
        : assessments.length
          ? "Every assessment contains the metadata needed for a reviewable assignment brief."
          : "No assessment has been designed.",
    },
    {
      id: "module-guides",
      label: "Teachable module guides",
      status: incompleteModules.length ? "review" : project.modules.length ? "pass" : "block",
      detail: incompleteModules.length
        ? `${incompleteModules.length} module${incompleteModules.length === 1 ? "" : "s"} lack a driving question, mapped object, source, or course connection.`
        : project.modules.length
          ? "Every module has a question, mapped outcomes and concepts, sources, and course connections."
          : "No module sequence has been designed.",
    },
    {
      id: "student-policies",
      label: "Student-facing policies",
      status: policyFields.every((value) => value?.trim()) ? "pass" : "review",
      detail: policyFields.every((value) => value?.trim())
        ? "Accessibility, academic-integrity, tool-use, and communication expectations are explicit."
        : "Complete accessibility, academic-integrity, and communication language before learner release.",
    },
    {
      id: "source-rights",
      label: "Source access and rights",
      status: project.sources.some((source) => source.license === "unknown") ? "review" : "pass",
      detail: project.sources.some((source) => source.license === "unknown")
        ? "At least one source has unknown reuse rights; the package limits it to citation and linking."
        : "Source reuse conditions are documented.",
    },
    {
      id: "freshness",
      label: "Source freshness",
      status: dueSources.length ? "review" : "pass",
      detail: dueSources.length
        ? `${dueSources.length} approved source${dueSources.length === 1 ? "" : "s"} require a freshness review.`
        : "Tracked sources are within their stated review intervals.",
    },
    {
      id: "assumptions",
      label: "Visible assumptions",
      status: project.assumptions.some((item) => item.status === "open") ? "review" : "pass",
      detail: project.assumptions.some((item) => item.status === "open")
        ? "Open assumptions remain named with owners and rationale; confirm them before learner release."
        : "All recorded assumptions are resolved.",
    },
    {
      id: "version",
      label: "Instructor-approved version",
      status: project.versions.length ? "pass" : "review",
      detail: project.versions.length
        ? `Latest immutable version: ${project.versions.at(-1)?.label}.`
        : "Create an instructor-approved version after resolving learner-release findings.",
    },
  ];
  const blocked = checks.filter((check) => check.status === "block").length;
  const review = checks.filter((check) => check.status === "review").length;
  const passed = checks.filter((check) => check.status === "pass").length;
  return {
    status: blocked ? "blocked" : review ? "review_required" : "ready",
    checks,
    passed,
    review,
    blocked,
    studentReleaseReady: blocked === 0 && review === 0,
  };
}

const artifactStatusLabel = (quality: OutputQualitySummary) => {
  if (quality.status === "blocked") return "BLOCKED — NOT FOR LEARNER USE";
  if (quality.status === "review_required") return "DRAFT — INSTRUCTOR REVIEW REQUIRED";
  return "INSTRUCTOR-APPROVED RELEASE";
};

export function renderStudentSyllabus(project: ProjectState, generatedAt = new Date().toISOString()) {
  const quality = evaluateOutputQuality(project, generatedAt);
  const assessments = project.modules.flatMap((module) => module.assessments);
  const status = artifactStatusLabel(quality);
  const lines = [
    "---",
    `title: "${project.spec.title.replaceAll('"', '\\"')}"`,
    'artifact: "student-syllabus"',
    `artifact_status: "${quality.status}"`,
    `renderer_version: "${OUTPUT_RENDERER_VERSION}"`,
    `generated_at: "${generatedAt}"`,
    `project_id: "${project.id}"`,
    "---",
    "",
    `# ${project.spec.title}`,
    "",
    `> **${status}.** ${quality.review || quality.blocked ? "Resolve the output-quality report before distributing this document to students." : "This document derives from the approved canonical course version."}`,
    "",
    "<!-- object:course-spec " + project.spec.id + " -->",
    "## Course overview",
    "",
    project.spec.catalogDescription?.trim() || missing("Write the catalog description."),
    "",
    "### Why this course",
    "",
    project.spec.rationale?.trim() || missing("Explain the course rationale."),
    "",
    "| Course fact | Value |",
    "| --- | --- |",
    `| Subject | ${mdCell(project.spec.subject)} |`,
    `| Level and role | ${mdCell(`${project.spec.academicLevel}; ${project.spec.courseRole}`)} |`,
    `| Duration | ${project.spec.weeks} weeks; ${project.spec.sessionsPerWeek} × ${project.spec.minutesPerSession}-minute sessions weekly |`,
    `| Expected independent work | ${project.spec.independentMinutesPerWeek} minutes per week |`,
    `| Modality | ${mdCell(project.spec.modality)} |`,
    `| Expected enrollment | ${project.spec.enrollment} |`,
    `| Materials budget | Up to $${project.spec.materialCostMax} |`,
    "",
    "## Learners, prerequisites, and entry support",
    "",
    project.spec.learnerProfile,
    "",
    `**Expected prior knowledge:** ${project.spec.priorKnowledge}`,
    "",
    `**Prerequisites:** ${project.spec.prerequisites}`,
    "",
    `**Diagnostic and support plan:** ${project.spec.diagnosticPlan?.trim() || missing("Document the ungraded entry diagnostic and support response.")}`,
    "",
    "## Learning outcomes",
    "",
    ...project.outcomes.flatMap((outcome) => [
      `<!-- object:learning-outcome ${outcome.id} -->`,
      `### ${outcome.code}`,
      "",
      `${outcome.conditions}, students will **${outcome.action.toLowerCase()} ${outcome.object}**. Success requires: ${outcome.criteria}.`,
      "",
    ]),
    "## Materials and access",
    "",
    ...(project.spec.requiredMaterials?.length
      ? project.spec.requiredMaterials.map((item) => `- ${item}`)
      : [missing("List required materials and no-cost alternatives.")]),
    "",
    `**Accessibility target:** ${project.spec.accessibilityTarget}`,
    "",
    project.spec.accessibilityStatement?.trim() || missing("Add the institutionally appropriate accessibility statement."),
    "",
    "## Term schedule",
    "",
    "| Weeks | Module and guiding question | Outcomes | Estimated module workload |",
    "| --- | --- | --- | ---: |",
    ...project.modules.map((module, index) => {
      const window = moduleWindow(project, index);
      return `| ${window.start}${window.end > window.start ? `–${window.end}` : ""} | **${mdCell(module.title)}** — ${mdCell(module.drivingQuestion || "Guiding question requires instructor completion")} | ${module.outcomeIds.map((id) => project.outcomes.find((item) => item.id === id)?.code).filter(Boolean).join(", ") || "Unmapped"} | ${module.estimatedStudentMinutes} min |`;
    }),
    "",
    "> Module windows are a planning sequence derived from the approved term length. Confirm institutional dates, holidays, and due dates before distribution.",
    "",
    "## Learning and feedback",
    "",
    "Students encounter source-backed explanations, guided or collaborative practice, feedback, and opportunities to revise before aligned high-stakes work. Each activity states its feedback path and available access alternatives in the module guide.",
    "",
    "## Assessments",
    "",
    "| Assessment | Purpose | Outcomes | Stakes | Student time |",
    "| --- | --- | --- | --- | ---: |",
    ...assessments.map(
      (assessment) =>
        `| ${mdCell(assessment.title)} | ${mdCell(assessment.purpose || "Purpose requires instructor completion")} | ${assessment.outcomeIds.map((id) => project.outcomes.find((item) => item.id === id)?.code).filter(Boolean).join(", ")} | ${assessment.stakes} | ${assessment.estimatedMinutes} min |`,
    ),
    "",
    "Detailed assignment briefs, expected evidence, evaluation criteria, collaboration rules, tool policies, access paths, and feedback strategies are included in the academic package.",
    "",
    "## Academic integrity, sources, and tools",
    "",
    project.spec.academicIntegrityPolicy?.trim() || missing("Add the applicable academic-integrity and tool-use policy."),
    "",
    "## Communication and feedback expectations",
    "",
    project.spec.communicationPolicy?.trim() || missing("State communication and feedback expectations."),
    "",
    "## Important limits",
    "",
    "This syllabus does not replace institutional policy, accommodation processes, or instructor judgment. Source links do not imply permission to redistribute source content. The instructor must confirm local dates, contacts, grading weights, and institution-specific policy language before learner release.",
  ];
  return lines.join("\n");
}

export function renderAssessmentGuide(project: ProjectState, assessment: Assessment) {
  const courseModule = project.modules.find((item) =>
    item.assessments.some((candidate) => candidate.id === assessment.id),
  );
  const outcomes = assessment.outcomeIds.map((id) => outcomeLabel(project, id));
  return [
    `# ${assessment.title}`,
    "",
    `> **${assessment.stakes.toUpperCase()} · ${assessment.type} · ${assessment.estimatedMinutes} estimated student minutes**`,
    "",
    `<!-- object:assessment ${assessment.id} -->`,
    `**Module:** ${courseModule ? `${courseModule.order}. ${courseModule.title}` : "Unresolved module"}`,
    "",
    "## Purpose and alignment",
    "",
    assessment.purpose?.trim() || missing("State the assessment purpose."),
    "",
    "**Mapped outcomes**",
    "",
    ...outcomes.map((outcome) => `- ${outcome}`),
    "",
    assessment.alignmentRationale?.trim() || missing("Explain why this task elicits the mapped outcomes."),
    "",
    "## Student task",
    "",
    assessment.task,
    "",
    "## Expected evidence",
    "",
    ...(assessment.expectedEvidence?.length
      ? assessment.expectedEvidence.map((item) => `- ${item}`)
      : [missing("List the observable evidence students must submit.")]),
    "",
    "## Evaluation criteria",
    "",
    "| Criterion | Evidence the evaluator should inspect |",
    "| --- | --- |",
    ...assessment.rubricCriteria.map(
      (criterion) =>
        `| ${mdCell(criterion)} | Inspect the submitted work for direct, attributable evidence of ${mdCell(criterion.toLowerCase())}; finalize performance-level descriptors before grading. |`,
    ),
    "",
    "> Performance-level descriptors and weights require instructor approval. Resea does not invent scoring thresholds from criterion labels.",
    "",
    "## Feedback and grading",
    "",
    assessment.feedbackStrategy?.trim() || missing("State when and how feedback will support revision."),
    "",
    `**Estimated grading load:** ${assessment.gradingMinutesPerStudent} minutes per student; approximately ${assessment.gradingMinutesPerStudent * project.spec.enrollment} minutes for ${project.spec.enrollment} students.`,
    "",
    "## Collaboration, sources, tools, and integrity",
    "",
    `**Collaboration:** ${assessment.collaborationPolicy?.trim() || missing("Define permitted collaboration and attribution.")}`,
    "",
    `**Sources and originality:** ${assessment.sourcePolicy?.trim() || missing("Define citation, originality, and source-verification requirements.")}`,
    "",
    `**Tools:** ${assessment.toolPolicy.trim() || missing("Define permitted tools, disclosure, and prohibited substitution.")}`,
    "",
    `**Integrity notes:** ${assessment.integrityNotes?.trim() || missing("Document foreseeable integrity or security risks.")}`,
    "",
    "## Accessibility and equivalent pathways",
    "",
    ...(assessment.accessibilityAlternatives.length
      ? assessment.accessibilityAlternatives.map((item) => `- ${item}`)
      : [missing("Add an equivalent access path that preserves the assessed construct.")]),
    "",
    "## Evaluator guidance",
    "",
    assessment.evaluatorGuidance?.trim() || missing("Add evaluator or solution guidance appropriate to the task."),
  ].join("\n");
}

export function renderModuleGuide(project: ProjectState, courseModule: Module) {
  return [
    `# Module ${courseModule.order}: ${courseModule.title}`,
    "",
    `<!-- object:module ${courseModule.id} -->`,
    courseModule.summary,
    "",
    "## Guiding question",
    "",
    courseModule.drivingQuestion?.trim() || missing("Add the authentic question or context that organizes this module."),
    "",
    "## Outcomes and concepts",
    "",
    ...courseModule.outcomeIds.map((id) => `- **Outcome:** ${outcomeLabel(project, id)}`),
    ...courseModule.conceptIds.map((id) => {
      const concept = project.concepts.find((item) => item.id === id);
      return concept
        ? `- **${concept.role} concept:** ${concept.label} — ${concept.definition}`
        : `- **Missing concept:** ${id}`;
    }),
    "",
    "## Source-backed resources",
    "",
    ...courseModule.sourceIds.map((id) => {
      const source = project.sources.find((item) => item.id === id);
      return source
        ? `- ${sourceCitation(source)} Access: ${source.access.replace("_", " ")}; reuse: ${source.licenseLabel ?? source.license}.`
        : `- Missing source (${id})`;
    }),
    "",
    "## Practice and feedback",
    "",
    ...(courseModule.activities.length
      ? courseModule.activities.flatMap((activity) => [
          `### ${activity.title}`,
          "",
          `**Type and time:** ${activity.type}; ${activity.estimatedMinutes} minutes`,
          "",
          activity.instructions,
          "",
          `**Preparation:** ${activity.preparation?.trim() || "No advance preparation specified."}`,
          "",
          `**Feedback:** ${activity.feedback}`,
          "",
          "**Success indicators**",
          "",
          ...(activity.successIndicators?.length
            ? activity.successIndicators.map((item) => `- ${item}`)
            : [missing("Add observable success indicators for this activity.")]),
          "",
          "**Equivalent access paths**",
          "",
          ...(activity.accessibilityAlternatives.length
            ? activity.accessibilityAlternatives.map((item) => `- ${item}`)
            : [missing("Add an equivalent access path.")]),
          "",
        ])
      : [missing("Add feedback-bearing practice before learner use."), ""]),
    "## Assessment evidence",
    "",
    ...(courseModule.assessments.length
      ? courseModule.assessments.map(
          (assessment) =>
            `- **${assessment.title} (${assessment.stakes}):** ${assessment.purpose || assessment.task}`,
        )
      : ["No assessment is scheduled in this module. Confirm that its outcomes are assessed later."]),
    "",
    "## Misconceptions and recovery",
    "",
    ...(courseModule.misconceptions?.length
      ? courseModule.misconceptions.map((item) => `- ${item}`)
      : [missing("Document likely misconceptions and recovery actions.")]),
    "",
    "## Workload and course connections",
    "",
    `**Estimated student workload:** ${courseModule.estimatedStudentMinutes} minutes.`,
    "",
    courseModule.connections?.trim() || missing("Explain how this module connects to prior and later work."),
    "",
    "## Instructor notes",
    "",
    ...(courseModule.instructorNotes?.length
      ? courseModule.instructorNotes.map((item) => `- ${item}`)
      : ["No private instructor note has been recorded."]),
  ].join("\n");
}

export function renderAnnotatedBibliography(project: ProjectState) {
  return [
    "# Annotated bibliography and source-use inventory",
    "",
    "> Public access is not permission to adapt or redistribute. Entries preserve access and license decisions separately.",
    "",
    ...project.sources.flatMap((source, index) => [
      `## ${index + 1}. ${source.title}`,
      "",
      sourceCitation(source),
      "",
      `**Type and publisher:** ${source.sourceType}; ${source.publisher}`,
      "",
      `**Research use:** ${source.rationale}`,
      "",
      `**Access and rights:** ${source.access.replace("_", " ")}; ${source.licenseLabel ?? source.license}; allowed actions: ${source.allowedActions.join(", ") || "none recorded"}.`,
      "",
      `**Review:** ${source.reviewState.replace("_", " ")}; last checked ${formatDate(source.lastChecked)}; next review ${formatDate(source.nextCheck)}; volatility ${source.volatility.replace("_", " ")}.`,
      "",
    ]),
  ].join("\n");
}

export function renderInstructorGuide(project: ProjectState) {
  const findings = runAudit(project);
  const metrics = alignmentMetrics(project);
  const totalWorkload = project.modules.reduce(
    (total, module) => total + module.estimatedStudentMinutes,
    0,
  );
  const totalGrading = project.modules
    .flatMap((module) => module.assessments)
    .reduce(
      (total, assessment) =>
        total + assessment.gradingMinutesPerStudent * project.spec.enrollment,
      0,
    );
  return [
    `# Instructor guide: ${project.spec.title}`,
    "",
    "## Instructional rationale",
    "",
    project.spec.rationale?.trim() || missing("Complete the course rationale."),
    "",
    "## Entry diagnostic and support",
    "",
    project.spec.diagnosticPlan?.trim() || missing("Complete the diagnostic and support plan."),
    "",
    "## Assumptions register",
    "",
    ...project.assumptions.map(
      (item) =>
        `- **${item.status.toUpperCase()} · ${item.confidence} confidence · owner: ${item.owner}:** ${item.statement} _Rationale: ${item.rationale}_`,
    ),
    "",
    "## Pacing and workload",
    "",
    `- Total modeled student workload: ${totalWorkload} minutes across ${project.spec.weeks} weeks (average ${Math.round(totalWorkload / Math.max(1, project.spec.weeks))} minutes/week).`,
    `- Stated weekly course budget: ${project.spec.independentMinutesPerWeek + project.spec.sessionsPerWeek * project.spec.minutesPerSession} minutes.`,
    `- Modeled grading load for listed assessments: ${totalGrading} minutes across ${project.spec.enrollment} students.`,
    "",
    "| Module | Planned weeks | Workload | Approx. minutes/week in window | Review state |",
    "| --- | --- | ---: | ---: | --- |",
    ...project.modules.map((module, index) => {
      const window = moduleWindow(project, index);
      return `| ${module.order}. ${mdCell(module.title)} | ${window.start}${window.end > window.start ? `–${window.end}` : ""} | ${module.estimatedStudentMinutes} | ${Math.ceil(module.estimatedStudentMinutes / window.span)} | ${module.reviewState.replace("_", " ")} |`;
    }),
    "",
    "## Module playbooks",
    "",
    ...project.modules.flatMap((module) => [
      `### ${module.order}. ${module.title}`,
      "",
      `**Guiding question:** ${module.drivingQuestion || "Requires instructor completion."}`,
      "",
      module.connections || "Course connection requires instructor completion.",
      "",
      ...(module.instructorNotes?.map((note) => `- ${note}`) ?? ["- No instructor notes recorded."]),
      "",
    ]),
    "## Assessment strategy",
    "",
    ...project.modules.flatMap((module) =>
      module.assessments.map(
        (assessment) =>
          `- **${assessment.title} (${assessment.stakes}):** ${assessment.alignmentRationale || "Alignment rationale requires instructor completion."} Feedback: ${assessment.feedbackStrategy || "requires completion"}`,
      ),
    ),
    "",
    "## Evidence and source-use policy",
    "",
    `The design contains ${project.sources.length} sources, ${project.evidence.length} exact evidence units, and ${project.claims.length} qualified claims. Instructors should verify source scope, locators, access, and rights before adapting or redistributing content.`,
    "",
    "## Quality decisions before learner release",
    "",
    `- Structural coverage: ${metrics.assessmentCoverage}% outcome–assessment; ${metrics.practiceCoverage}% outcome–practice.`,
    `- Open audit findings: ${reviewCounts(findings)}.`,
    ...findings.map(
      (item) =>
        `- **${item.severity.toUpperCase()} · ${item.ruleId}: ${item.title}.** ${item.description} _Required response: ${item.remediation}_`,
    ),
    "",
    "Passing deterministic checks does not certify disciplinary correctness, assessment validity, accessibility compliance, or institutional policy alignment. A named instructor remains responsible for learner-facing publication.",
  ].join("\n");
}

export function renderQualityReport(project: ProjectState, generatedAt = new Date().toISOString()) {
  const quality = evaluateOutputQuality(project, generatedAt);
  const findings = runAudit(project);
  const metrics = alignmentMetrics(project);
  return [
    "# Course output quality report",
    "",
    `**Generated:** ${generatedAt}`,
    "",
    `**Artifact status:** ${artifactStatusLabel(quality)}`,
    "",
    `**Output checks:** ${quality.passed} pass; ${quality.review} require review; ${quality.blocked} block learner release.`,
    "",
    "## Output-readiness checks",
    "",
    "| Status | Check | Detail |",
    "| --- | --- | --- |",
    ...quality.checks.map(
      (check) =>
        `| ${check.status.toUpperCase()} | ${mdCell(check.label)} | ${mdCell(check.detail)} |`,
    ),
    "",
    "## Alignment indicators",
    "",
    `- Outcome–assessment coverage: ${metrics.assessmentCoverage}%`,
    `- Outcome–practice coverage: ${metrics.practiceCoverage}%`,
    `- Orphan assessments: ${metrics.orphanAssessments}`,
    "",
    "## Deterministic audit findings",
    "",
    ...(findings.length
      ? findings.map(
          (item) =>
            `- **${item.severity.toUpperCase()} · ${item.ruleId} · ${item.category}: ${item.title}.** ${item.description} Remediation: ${item.remediation}`,
        )
      : ["No deterministic findings are open."]),
    "",
    "## Interpretation",
    "",
    "These checks establish completeness, traceability, and explicit review needs. They do not certify the truth of disciplinary claims, the validity of an assessment, compliance with local policy, or suitability for a particular learner. Those decisions require named human review.",
  ].join("\n");
}

export function renderFreshnessReport(project: ProjectState, generatedAt = new Date().toISOString()) {
  const today = generatedAt.slice(0, 10);
  return [
    "# Source freshness and change report",
    "",
    `**Generated:** ${generatedAt}`,
    "",
    "| Source | Volatility | Last checked | Next review | Status | Downstream questions |",
    "| --- | --- | --- | --- | --- | --- |",
    ...project.sources.map(
      (source) =>
        `| [${mdCell(source.title)}](${source.canonicalUrl}) | ${source.volatility.replace("_", " ")} | ${source.lastChecked} | ${source.nextCheck} | ${source.nextCheck < today ? "DUE" : "current"} | ${source.researchQuestionIds.join(", ") || "none"} |`,
    ),
    "",
    "A current retrieval date does not establish truth or continued relevance. Changed evidence must produce an explicit impact proposal before approved curriculum objects are revised.",
  ].join("\n");
}

export function renderAlignmentCsv(project: ProjectState) {
  const rows = [[
    "Outcome ID",
    "Outcome code",
    "Performance",
    "Conditions",
    "Success criteria",
    "Review state",
    "Concepts",
    "Modules",
    "Activities",
    "Assessments",
    "Provenance claims",
  ]];
  const activities = project.modules.flatMap((module) => module.activities);
  const assessments = project.modules.flatMap((module) => module.assessments);
  for (const outcome of project.outcomes) {
    rows.push([
      outcome.id,
      outcome.code,
      `${outcome.action} ${outcome.object}`,
      outcome.conditions,
      outcome.criteria,
      outcome.reviewState,
      outcome.conceptIds
        .map((id) => project.concepts.find((item) => item.id === id)?.label)
        .filter(Boolean)
        .join("; "),
      project.modules
        .filter((module) => module.outcomeIds.includes(outcome.id))
        .map((module) => `${module.order}. ${module.title}`)
        .join("; "),
      activities
        .filter((item) => item.outcomeIds.includes(outcome.id))
        .map((item) => item.title)
        .join("; "),
      assessments
        .filter((item) => item.outcomeIds.includes(outcome.id))
        .map((item) => item.title)
        .join("; "),
      outcome.provenanceClaimIds.join("; "),
    ]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function renderScheduleCsv(project: ProjectState) {
  const rows = [[
    "Start week",
    "End week",
    "Module",
    "Guiding question",
    "Outcome codes",
    "Student minutes",
    "Approx. minutes per week",
    "Review state",
  ]];
  project.modules.forEach((module, index) => {
    const window = moduleWindow(project, index);
    rows.push([
      String(window.start),
      String(window.end),
      `${module.order}. ${module.title}`,
      module.drivingQuestion ?? "",
      module.outcomeIds
        .map((id) => project.outcomes.find((item) => item.id === id)?.code)
        .filter(Boolean)
        .join("; "),
      String(module.estimatedStudentMinutes),
      String(Math.ceil(module.estimatedStudentMinutes / window.span)),
      module.reviewState,
    ]);
  });
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function renderRubricsCsv(project: ProjectState) {
  const rows = [[
    "Assessment ID",
    "Assessment",
    "Stakes",
    "Outcome codes",
    "Criterion",
    "Expected evidence",
    "Instructor action",
  ]];
  for (const assessment of project.modules.flatMap((module) => module.assessments)) {
    for (const criterion of assessment.rubricCriteria) {
      rows.push([
        assessment.id,
        assessment.title,
        assessment.stakes,
        assessment.outcomeIds
          .map((id) => project.outcomes.find((item) => item.id === id)?.code)
          .filter(Boolean)
          .join("; "),
        criterion,
        assessment.expectedEvidence?.join("; ") ?? "",
        "Approve performance-level descriptors and weighting before grading",
      ]);
    }
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function renderEvidenceMapCsv(project: ProjectState) {
  const rows = [[
    "Claim ID",
    "Claim type",
    "Claim",
    "Inference",
    "Claim review",
    "Evidence ID",
    "Exact evidence",
    "Locator",
    "Evidence review",
    "Source",
    "Canonical URL",
    "License",
  ]];
  for (const claim of project.claims) {
    const evidenceIds = claim.supportingEvidenceIds.length
      ? claim.supportingEvidenceIds
      : [""];
    for (const evidenceId of evidenceIds) {
      const evidence = project.evidence.find((item) => item.id === evidenceId);
      const source = project.sources.find((item) => item.id === evidence?.sourceId);
      rows.push([
        claim.id,
        claim.type,
        claim.text,
        claim.inference,
        claim.reviewState,
        evidence?.id ?? "",
        evidence?.exactText ?? "",
        evidence?.locator ?? "",
        evidence?.reviewState ?? "",
        source?.title ?? "",
        source?.canonicalUrl ?? "",
        source?.licenseLabel ?? source?.license ?? "",
      ]);
    }
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function renderAcademicPackage(project: ProjectState, generatedAt = new Date().toISOString()) {
  return [
    renderStudentSyllabus(project, generatedAt),
    "",
    "---",
    "",
    renderInstructorGuide(project),
    "",
    "---",
    "",
    renderAnnotatedBibliography(project),
    "",
    "---",
    "",
    renderQualityReport(project, generatedAt),
    "",
    "# Appendix: version and approval history",
    "",
    ...(project.versions.length
      ? project.versions.map(
          (version) =>
            `- **${version.label} · ${formatDate(version.createdAt)} · ${version.approvedBy}:** ${version.releaseNotes} Manifest: \`${version.manifestHash}\`; ${version.findingCount} findings recorded.`,
        )
      : [missing("Publish an immutable instructor-approved version.")]),
  ].join("\n");
}

export function buildTextArtifacts(project: ProjectState, generatedAt = new Date().toISOString()) {
  const artifacts: Record<string, string> = {
    "README.md": [
      `# ${project.spec.title}: Resea academic package`,
      "",
      `Generated ${generatedAt} with renderer ${OUTPUT_RENDERER_VERSION}.`,
      "",
      `**Status:** ${artifactStatusLabel(evaluateOutputQuality(project, generatedAt))}`,
      "",
      "Start with `quality/output-quality-report.md`. Student-facing and instructor-facing materials are deliberately separated. Canonical objects remain in `project.json`; rendered files are derivatives and must not be edited as a hidden second course copy.",
    ].join("\n"),
    "student/syllabus.md": renderStudentSyllabus(project, generatedAt),
    "instructor/instructor-guide.md": renderInstructorGuide(project),
    "research/annotated-bibliography.md": renderAnnotatedBibliography(project),
    "research/evidence-map.csv": renderEvidenceMapCsv(project),
    "quality/output-quality-report.md": renderQualityReport(project, generatedAt),
    "quality/freshness-report.md": renderFreshnessReport(project, generatedAt),
    "data/alignment.csv": renderAlignmentCsv(project),
    "data/schedule.csv": renderScheduleCsv(project),
    "data/rubrics.csv": renderRubricsCsv(project),
  };
  for (const courseModule of project.modules) {
    artifacts[
      `modules/${String(courseModule.order).padStart(2, "0")}-${slug(courseModule.title)}.md`
    ] = renderModuleGuide(project, courseModule);
  }
  for (const assessment of project.modules.flatMap((module) => module.assessments)) {
    artifacts[`assessments/${slug(assessment.title)}.md`] =
      renderAssessmentGuide(project, assessment);
  }
  return artifacts;
}
