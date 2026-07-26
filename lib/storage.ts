import { openDB } from "idb";
import type { ProjectState } from "./types";

const DB_NAME = "resea";
const STORE = "projects";

async function database() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export async function loadProject(projectId: string): Promise<ProjectState | undefined> {
  const db = await database();
  return db.get(STORE, projectId);
}

export async function saveProject(project: ProjectState) {
  const db = await database();
  await db.put(STORE, project);
}

export async function clearProject(projectId: string) {
  const db = await database();
  await db.delete(STORE, projectId);
}

export async function requestDurableStorage() {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist();
}

export async function storageEstimate() {
  if (!navigator.storage?.estimate) return null;
  return navigator.storage.estimate();
}
