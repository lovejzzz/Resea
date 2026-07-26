import JSZip from "jszip";
import type { ProjectState } from "./types";
import { alignmentMetrics, auditSummary, runAudit } from "./audit";
import { csvCell, downloadBlob, formatDate, sha256 } from "./utils";

function courseOutcomeText(project: ProjectState, outcomeId: string) {
  const outcome = project.outcomes.find((item) => item.id === outcomeId);
  return outcome
    ? `${outcome.code}: ${outcome.action} ${outcome.object}`
    : "Unknown outcome";
}

export function renderMarkdown(project: ProjectState) {
  const findings = runAudit(project);
  const metrics = alignmentMetrics(project);
  const lines = [
    "---",
    `title: "${project.spec.title.replaceAll('"', '\\"')}"`,
    `schema_version: "${project.schemaVersion}"`,
    `project_id: "${project.id}"`,
    `generated_at: "${new Date().toISOString()}"`,
    "citation_style: simple-linked-source-note",
    "---",
    "",
    `# ${project.spec.title}`,
    "",
    `**Subject:** ${project.spec.subject}  `,
    `**Level and role:** ${project.spec.academicLevel}; ${project.spec.courseRole}  `,
    `**Duration:** ${project.spec.weeks} weeks; ${project.spec.sessionsPerWeek} × ${project.spec.minutesPerSession}-minute sessions weekly  `,
    `**Modality:** ${project.spec.modality}  `,
    `**Risk tier:** ${project.spec.riskTier.replace("_", " ")}`,
    "",
    "## Course rationale and learners",
    "",
    project.spec.learnerProfile,
    "",
    `**Prior knowledge:** ${project.spec.priorKnowledge}`,
    "",
    `**Prerequisites:** ${project.spec.prerequisites}`,
    "",
    "## Learning outcomes",
    "",
    ...project.outcomes.flatMap((outcome) => [
      `### ${outcome.code}`,
      "",
      `${outcome.conditions}, students will **${outcome.action.toLowerCase()} ${outcome.object}**. Success requires: ${outcome.criteria}.`,
      "",
    ]),
    "## Term design",
    "",
    ...project.modules.flatMap((module) => [
      `### ${module.order}. ${module.title}`,
      "",
      module.summary,
      "",
      `**Mapped outcomes:** ${module.outcomeIds.map((id) => courseOutcomeText(project, id).split(":")[0]).join(", ") || "None"}`,
      "",
      `**Estimated workload:** ${module.estimatedStudentMinutes} minutes`,
      "",
      ...(module.activities.length
        ? [
            "**Practice and feedback**",
            "",
            ...module.activities.map(
              (activity) =>
                `- **${activity.title}:** ${activity.instructions} _Feedback: ${activity.feedback}._`,
            ),
            "",
          ]
        : ["**Practice and feedback:** Not yet designed.", ""]),
      ...(module.assessments.length
        ? [
            "**Assessment**",
            "",
            ...module.assessments.map(
              (assessment) =>
                `- **${assessment.title} (${assessment.stakes}):** ${assessment.task}`,
            ),
            "",
          ]
        : []),
      `**Sources:** ${module.sourceIds
        .map((id) => {
          const source = project.sources.find((item) => item.id === id);
          return source ? `[${source.title}](${source.canonicalUrl})` : "Missing source";
        })
        .join("; ") || "None"}`,
      "",
    ]),
    "## Assessment and alignment",
    "",
    "| Outcome | Practice | Assessment |",
    "| --- | --- | --- |",
    ...project.outcomes.map((outcome) => {
      const practices = project.modules
        .flatMap((module) => module.activities)
        .filter((activity) => activity.outcomeIds.includes(outcome.id))
        .map((activity) => activity.title)
        .join("; ");
      const assessments = project.modules
        .flatMap((module) => module.assessments)
        .filter((assessment) => assessment.outcomeIds.includes(outcome.id))
        .map((assessment) => assessment.title)
        .join("; ");
      return `| ${outcome.code}: ${outcome.action} ${outcome.object} | ${practices || "Gap"} | ${assessments || "Gap"} |`;
    }),
    "",
    "## Assumptions register",
    "",
    ...project.assumptions.map(
      (item) =>
        `- **${item.status.toUpperCase()} · ${item.confidence} confidence:** ${item.statement} _${item.rationale}_ Owner: ${item.owner}.`,
    ),
    "",
    "## Evidence inventory",
    "",
    ...project.sources.map(
      (source, index) =>
        `${index + 1}. [${source.title}](${source.canonicalUrl}). ${source.authors.join(", ")}. ${source.publisher}. Access: ${source.access}; license: ${source.licenseLabel ?? source.license}. Retrieved ${formatDate(source.lastChecked)}.`,
    ),
    "",
    "## Quality report",
    "",
    `- Outcome–assessment coverage: ${metrics.assessmentCoverage}%`,
    `- Outcome–practice coverage: ${metrics.practiceCoverage}%`,
    `- Open findings: ${findings.length}`,
    `- Publication status: ${auditSummary(findings).canPublish ? "No critical blockers" : "Blocked by critical findings"}`,
    "",
    ...findings.map(
      (item) =>
        `- **${item.severity.toUpperCase()} · ${item.ruleId}: ${item.title}.** ${item.description} Remediation: ${item.remediation}`,
    ),
    "",
    "## Provenance and limitations",
    "",
    "This package was assembled from canonical browser-local objects. Public access is not treated as permission to redistribute. Research sufficiency is a documented decision, not a claim of universal internet coverage. All source interpretations and disciplinary judgments require instructor review.",
  ];
  return lines.join("\n");
}

export function renderAlignmentCsv(project: ProjectState) {
  const rows = [["Outcome code", "Outcome", "Concepts", "Activities", "Assessments"]];
  const activities = project.modules.flatMap((module) => module.activities);
  const assessments = project.modules.flatMap((module) => module.assessments);
  for (const outcome of project.outcomes) {
    rows.push([
      outcome.code,
      `${outcome.action} ${outcome.object}`,
      outcome.conceptIds
        .map((id) => project.concepts.find((item) => item.id === id)?.label)
        .filter(Boolean)
        .join("; "),
      activities
        .filter((item) => item.outcomeIds.includes(outcome.id))
        .map((item) => item.title)
        .join("; "),
      assessments
        .filter((item) => item.outcomeIds.includes(outcome.id))
        .map((item) => item.title)
        .join("; "),
    ]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export async function exportProject(project: ProjectState, format: "markdown" | "json" | "csv" | "bundle") {
  const safeName = project.spec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (format === "markdown") {
    downloadBlob(`${safeName}.md`, new Blob([renderMarkdown(project)], { type: "text/markdown" }));
    return;
  }
  if (format === "json") {
    downloadBlob(
      `${safeName}.json`,
      new Blob([JSON.stringify({ ...project, findings: runAudit(project) }, null, 2)], {
        type: "application/json",
      }),
    );
    return;
  }
  if (format === "csv") {
    downloadBlob(`${safeName}-alignment.csv`, new Blob([renderAlignmentCsv(project)], { type: "text/csv" }));
    return;
  }
  const zip = new JSZip();
  const projectJson = JSON.stringify({ ...project, findings: runAudit(project) }, null, 2);
  const markdown = renderMarkdown(project);
  const alignment = renderAlignmentCsv(project);
  zip.file("manifest.json", JSON.stringify({
    format: "resea-project",
    formatVersion: "1.0.0",
    projectId: project.id,
    createdAt: new Date().toISOString(),
    projectSha256: await sha256(projectJson),
    exclusions: ["credentials", "model weights", "restricted source content"],
  }, null, 2));
  zip.file("project.json", projectJson);
  zip.file("exports/course.md", markdown);
  zip.file("exports/alignment.csv", alignment);
  zip.file("audits/latest.json", JSON.stringify(runAudit(project), null, 2));
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  downloadBlob(`${safeName}.resea`, blob);
}

export async function importProjectFile(file: File): Promise<ProjectState> {
  let raw: string;
  if (file.name.endsWith(".resea") || file.type === "application/zip") {
    const zip = await JSZip.loadAsync(file);
    const entry = zip.file("project.json");
    if (!entry) throw new Error("This bundle does not contain project.json.");
    raw = await entry.async("string");
    const manifestEntry = zip.file("manifest.json");
    if (manifestEntry) {
      const manifest = JSON.parse(await manifestEntry.async("string")) as {
        projectSha256?: string;
      };
      if (manifest.projectSha256 && (await sha256(raw)) !== manifest.projectSha256) {
        throw new Error("Bundle integrity check failed.");
      }
    }
  } else {
    raw = await file.text();
  }
  const parsed = JSON.parse(raw) as Partial<ProjectState>;
  if (
    parsed.schemaVersion !== "1.0.0" ||
    !parsed.id ||
    !parsed.spec ||
    !Array.isArray(parsed.sources) ||
    !Array.isArray(parsed.outcomes)
  ) {
    throw new Error("This is not a compatible Resea 1.0 project.");
  }
  return parsed as ProjectState;
}
