import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { importProjectFile, renderAlignmentCsv, renderMarkdown } from "../lib/export";
import { cloneSample } from "../lib/project";
import { sha256 } from "../lib/utils";

describe("canonical exports", () => {
  it("renders a structured academic Markdown package", () => {
    const markdown = renderMarkdown(cloneSample());
    expect(markdown).toContain("# Research Methods for the Social Sciences");
    expect(markdown).toContain("## Learning outcomes");
    expect(markdown).toContain("## Evidence inventory");
    expect(markdown).toContain("## Quality report");
    expect(markdown).toContain("https://doi.org/10.1038/sdata.2016.18");
    expect(markdown).not.toContain("[object Object]");
  });

  it("renders all outcomes in the alignment CSV", () => {
    const csv = renderAlignmentCsv(cloneSample());
    expect(csv.split("\n")).toHaveLength(5);
    expect(csv).toContain('"CLO 4"');
    expect(csv).toContain('"Transparent research package"');
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
});
