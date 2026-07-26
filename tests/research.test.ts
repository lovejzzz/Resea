import { describe, expect, it } from "vitest";
import { createBlankProject } from "../lib/project";
import { createResearchPlan, safeResearchUrl } from "../lib/research";

describe("research planning and source policy", () => {
  it("creates a bounded domain-neutral plan from the brief", () => {
    const project = createBlankProject();
    project.spec.subject = "Urban ecology";
    const plan = createResearchPlan(project.spec);
    expect(plan.questions.length).toBeGreaterThanOrEqual(5);
    expect(plan.maxSources).toBe(25);
    expect(plan.questions.every((question) => question.queries.length === 2)).toBe(true);
    expect(JSON.stringify(plan)).toContain("Urban ecology");
  });

  it("allows public HTTPS sources", () => {
    expect(safeResearchUrl("https://example.edu/paper")).toBe("https://example.edu/paper");
  });

  it.each([
    "http://example.edu/source",
    "https://localhost/private",
    "https://127.0.0.1/private",
    "https://192.168.1.4/private",
    "file:///etc/passwd",
  ])("blocks unsafe retrieval target %s", (url) => {
    expect(() => safeResearchUrl(url)).toThrow();
  });
});
