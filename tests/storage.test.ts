import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { clearProject, listProjects, loadProject, saveProject } from "../lib/storage";
import { createBlankProject } from "../lib/project";

describe("browser-local project repository", () => {
  const projectIds: string[] = [];

  afterEach(async () => {
    await Promise.all(projectIds.splice(0).map((id) => clearProject(id)));
  });

  it("round-trips canonical project state", async () => {
    const project = createBlankProject();
    projectIds.push(project.id);
    project.spec.title = "Evidence and Society";
    await saveProject(project);
    const restored = await loadProject(project.id);
    expect(restored?.spec.title).toBe("Evidence and Society");
    expect(restored?.schemaVersion).toBe("1.0.0");
    await clearProject(project.id);
    expect(await loadProject(project.id)).toBeUndefined();
  });

  it("lists saved projects with the most recently updated first", async () => {
    const older = createBlankProject();
    const newer = createBlankProject();
    projectIds.push(older.id, newer.id);
    older.updatedAt = "2026-01-01T00:00:00.000Z";
    newer.updatedAt = "2026-02-01T00:00:00.000Z";
    await saveProject(older);
    await saveProject(newer);

    expect((await listProjects()).map((project) => project.id)).toEqual([
      newer.id,
      older.id,
    ]);
  });
});
