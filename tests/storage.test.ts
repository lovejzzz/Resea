import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { clearProject, loadProject, saveProject } from "../lib/storage";
import { createBlankProject } from "../lib/project";

describe("browser-local project repository", () => {
  afterEach(async () => {
    const project = createBlankProject();
    await clearProject(project.id);
  });

  it("round-trips canonical project state", async () => {
    const project = createBlankProject();
    project.spec.title = "Evidence and Society";
    await saveProject(project);
    const restored = await loadProject(project.id);
    expect(restored?.spec.title).toBe("Evidence and Society");
    expect(restored?.schemaVersion).toBe("1.0.0");
    await clearProject(project.id);
    expect(await loadProject(project.id)).toBeUndefined();
  });
});
