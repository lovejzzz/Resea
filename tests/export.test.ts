import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import {
  buildTextArtifacts,
  evaluateOutputQuality,
  renderAssessmentGuide,
  renderStudentSyllabus,
} from "../lib/artifacts";
import {
  buildProjectBundle,
  importProjectFile,
  renderAlignmentCsv,
  renderMarkdown,
} from "../lib/export";
import { cloneSample, createBlankProject } from "../lib/project";
import { sha256 } from "../lib/utils";

describe("canonical exports", () => {
  it("renders a structured academic Markdown package", () => {
    const markdown = renderMarkdown(cloneSample());
    expect(markdown).toContain("# Research Methods for the Social Sciences");
    expect(markdown).toContain("## Learning outcomes");
    expect(markdown).toContain("## Evidence and source-use policy");
    expect(markdown).toContain("# Instructor guide:");
    expect(markdown).toContain("# Annotated bibliography and source-use inventory");
    expect(markdown).toContain("# Course output quality report");
    expect(markdown).toContain("## Academic integrity, sources, and tools");
    expect(markdown).toContain("https://doi.org/10.1038/sdata.2016.18");
    expect(markdown).not.toContain("[object Object]");
    expect(markdown).not.toContain("app-only");
  });

  it("renders detailed, traceable outcome alignment CSV", () => {
    const csv = renderAlignmentCsv(cloneSample());
    expect(csv.split("\n")).toHaveLength(5);
    expect(csv).toContain('"CLO 4"');
    expect(csv).toContain('"Transparent research package"');
    expect(csv).toContain('"Success criteria"');
    expect(csv).toContain('"Provenance claims"');
    expect(csv).toContain("Analysis, interpretation, and uncertainty");
  });

  it("separates reviewable student, instructor, assessment, and research artifacts", () => {
    const project = cloneSample();
    const artifacts = buildTextArtifacts(project, "2026-07-27T12:00:00.000Z");
    const assessment = project.modules[1].assessments[0];
    const assessmentGuide = renderAssessmentGuide(project, assessment);

    expect(Object.keys(artifacts)).toHaveLength(18);
    expect(artifacts["student/syllabus.md"]).toContain("## Term schedule");
    expect(artifacts["instructor/instructor-guide.md"]).toContain("## Pacing and workload");
    expect(artifacts["research/evidence-map.csv"]).toContain('"Exact evidence"');
    expect(artifacts["quality/output-quality-report.md"]).toContain("Output-readiness checks");
    expect(artifacts["data/rubrics.csv"]).toContain('"Instructor action"');
    expect(assessmentGuide).toContain("## Expected evidence");
    expect(assessmentGuide).toContain("## Collaboration, sources, tools, and integrity");
    expect(assessmentGuide).toContain("## Evaluator guidance");
  });

  it("labels review needs instead of inventing missing learner-facing content", () => {
    const blank = createBlankProject();
    const quality = evaluateOutputQuality(blank);
    const syllabus = renderStudentSyllabus(blank, "2026-07-27T12:00:00.000Z");

    expect(quality.status).toBe("blocked");
    expect(quality.studentReleaseReady).toBe(false);
    expect(syllabus).toContain("BLOCKED — NOT FOR LEARNER USE");
    expect(syllabus).toContain("Instructor completion required");
  });

  it("keeps the realistic sample in instructor-review state", () => {
    const quality = evaluateOutputQuality(cloneSample());
    expect(quality.blocked).toBe(0);
    expect(quality.review).toBeGreaterThan(0);
    expect(quality.status).toBe("review_required");
  });

  it("packages the complete artifact set with renderer and file checksums", async () => {
    const project = cloneSample();
    const blob = await buildProjectBundle(
      project,
      "2026-07-27T12:00:00.000Z",
    );
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const manifest = JSON.parse(
      await zip.file("manifest.json")!.async("string"),
    ) as { artifactCount: number; artifactStatus: string; rendererVersion: string };
    const checksums = JSON.parse(
      await zip.file("checksums.json")!.async("string"),
    ) as { files: Record<string, string> };

    expect(manifest.artifactCount).toBe(19);
    expect(manifest.artifactStatus).toBe("review_required");
    expect(manifest.rendererVersion).toBe("2.0.0");
    expect(zip.file("exports/student/syllabus.md")).toBeTruthy();
    expect(zip.file("exports/instructor/instructor-guide.md")).toBeTruthy();
    expect(zip.file("exports/assessments/transparent-research-package.md")).toBeTruthy();
    expect(zip.file("exports/research/evidence-map.csv")).toBeTruthy();
    expect(zip.file("exports/quality/output-quality-report.md")).toBeTruthy();
    expect(checksums.files["exports/student/syllabus.md"]).toMatch(/^[a-f0-9]{64}$/);

    const restored = await importProjectFile(
      new File([blob], "complete.resea", { type: "application/zip" }),
    );
    expect(restored.id).toBe(project.id);
  });

  it("restores a checksummed Resea bundle", async () => {
    const project = cloneSample();
    const raw = JSON.stringify(project);
    const zip = new JSZip();
    zip.file("project.json", raw);
    zip.file("manifest.json", JSON.stringify({
      format: "resea-project",
      formatVersion: "1.0.0",
      projectId: project.id,
      projectSha256: await sha256(raw),
    }));
    const archive = await zip.generateAsync({ type: "arraybuffer" });

    const restored = await importProjectFile(
      new File([archive], "sample.resea", { type: "application/zip" }),
    );
    expect(restored.id).toBe(project.id);
    expect(restored.modules).toHaveLength(project.modules.length);
  });

  it("rejects a bundle whose project content does not match its manifest", async () => {
    const project = cloneSample();
    const zip = new JSZip();
    zip.file("project.json", JSON.stringify(project));
    zip.file("manifest.json", JSON.stringify({
      format: "resea-project",
      formatVersion: "1.0.0",
      projectId: project.id,
      projectSha256: "not-the-project-hash",
    }));
    const archive = await zip.generateAsync({ type: "arraybuffer" });

    await expect(
      importProjectFile(
        new File([archive], "tampered.resea", { type: "application/zip" }),
      ),
    ).rejects.toThrow("Bundle integrity check failed.");
  });

  it("rejects a bundle whose rendered artifact was changed after export", async () => {
    const project = cloneSample();
    const blob = await buildProjectBundle(
      project,
      "2026-07-27T12:00:00.000Z",
    );
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    zip.file("exports/student/syllabus.md", "# Replaced after export");
    const archive = await zip.generateAsync({ type: "arraybuffer" });

    await expect(
      importProjectFile(
        new File([archive], "tampered-artifact.resea", {
          type: "application/zip",
        }),
      ),
    ).rejects.toThrow(
      "Bundle artifact integrity check failed: exports/student/syllabus.md.",
    );
  });
});
