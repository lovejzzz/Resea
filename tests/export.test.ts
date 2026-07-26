import { describe, expect, it } from "vitest";
import { renderAlignmentCsv, renderMarkdown } from "../lib/export";
import { cloneSample } from "../lib/project";

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
});
