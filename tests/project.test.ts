import { describe, expect, it } from "vitest";
import { cloneSample, createSampleProject } from "../lib/project";

describe("project creation", () => {
  it("creates independent sample working copies without published history", () => {
    const packaged = cloneSample();
    const first = createSampleProject();
    const second = createSampleProject();

    expect(first.id).not.toBe(packaged.id);
    expect(second.id).not.toBe(first.id);
    expect(first.spec.title).toBe(packaged.spec.title);
    expect(first.versions).toEqual([]);
    expect(first.events[0]?.action).toBe("Sample course loaded");
  });
});
