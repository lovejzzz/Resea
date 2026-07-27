import JSZip from "jszip";
import {
  buildTextArtifacts,
  evaluateOutputQuality,
  OUTPUT_RENDERER_VERSION,
  renderAcademicPackage,
  renderAlignmentCsv,
} from "./artifacts";
import { runAudit } from "./audit";
import type { ProjectState } from "./types";
import { downloadBlob, sha256 } from "./utils";

export { renderAlignmentCsv };
export const renderMarkdown = renderAcademicPackage;

const MAX_IMPORT_BYTES = 1024 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 10_000;
const MAX_PROJECT_JSON_CHARACTERS = 100 * 1024 * 1024;
const EXPORT_SCHEMA_VERSION = "1.1.0";

const safeFileName = (project: ProjectState) =>
  project.spec.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "resea-course";

const canonicalProject = (project: ProjectState): ProjectState => ({
  ...project,
  findings: runAudit(project),
});

async function createJsonExport(project: ProjectState, exportedAt: string) {
  const canonical = canonicalProject(project);
  const canonicalJson = JSON.stringify(canonical, null, 2);
  return JSON.stringify(
    {
      exportSchemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt,
      renderer: {
        id: "resea-deterministic-academic-package",
        version: OUTPUT_RENDERER_VERSION,
        profile: "academic_clean",
        citationStyle: "simple-linked-source-note",
      },
      quality: evaluateOutputQuality(project, exportedAt),
      canonicalProjectSha256: await sha256(canonicalJson),
      project: canonical,
    },
    null,
    2,
  );
}

export async function buildProjectBundle(
  project: ProjectState,
  exportedAt = new Date().toISOString(),
) {
  const zip = new JSZip();
  const canonical = canonicalProject(project);
  const projectJson = JSON.stringify(canonical, null, 2);
  const textArtifacts = buildTextArtifacts(project, exportedAt);
  textArtifacts["metadata/renderer-manifest.json"] = JSON.stringify(
    {
      id: "resea-deterministic-academic-package",
      version: OUTPUT_RENDERER_VERSION,
      exportSchemaVersion: EXPORT_SCHEMA_VERSION,
      generatedAt: exportedAt,
      profile: "academic_clean",
      citationStyle: "simple-linked-source-note",
      studentInstructorSeparation: true,
      sourceOfTruth: "project.json",
      artifactPaths: [
        ...Object.keys(textArtifacts),
        "metadata/renderer-manifest.json",
      ].sort(),
    },
    null,
    2,
  );

  const checksums: Record<string, string> = {
    "project.json": await sha256(projectJson),
  };
  for (const [path, content] of Object.entries(textArtifacts)) {
    checksums[`exports/${path}`] = await sha256(content);
  }
  const checksumsJson = JSON.stringify(
    {
      algorithm: "SHA-256",
      generatedAt: exportedAt,
      files: checksums,
    },
    null,
    2,
  );
  const quality = evaluateOutputQuality(project, exportedAt);
  const manifestJson = JSON.stringify(
    {
      format: "resea-project",
      formatVersion: "1.1.0",
      compatibleProjectSchema: "1.0.0",
      projectId: project.id,
      createdAt: exportedAt,
      projectSha256: checksums["project.json"],
      rendererVersion: OUTPUT_RENDERER_VERSION,
      artifactCount: Object.keys(textArtifacts).length,
      artifactStatus: quality.status,
      checksumsSha256: await sha256(checksumsJson),
      exclusions: [
        "credentials",
        "model weights",
        "restricted source content",
        "browser history",
      ],
    },
    null,
    2,
  );

  zip.file("manifest.json", manifestJson);
  zip.file("project.json", projectJson);
  zip.file("checksums.json", checksumsJson);
  zip.file("audits/latest.json", JSON.stringify(runAudit(project), null, 2));
  for (const [path, content] of Object.entries(textArtifacts)) {
    zip.file(`exports/${path}`, content);
  }
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export async function exportProject(
  project: ProjectState,
  format: "markdown" | "json" | "csv" | "bundle",
) {
  const exportedAt = new Date().toISOString();
  const safeName = safeFileName(project);
  if (format === "markdown") {
    downloadBlob(
      `${safeName}-academic-package.md`,
      new Blob([renderAcademicPackage(project, exportedAt)], {
        type: "text/markdown",
      }),
    );
    return;
  }
  if (format === "json") {
    downloadBlob(
      `${safeName}-canonical.json`,
      new Blob([await createJsonExport(project, exportedAt)], {
        type: "application/json",
      }),
    );
    return;
  }
  if (format === "csv") {
    downloadBlob(
      `${safeName}-alignment.csv`,
      new Blob([renderAlignmentCsv(project)], { type: "text/csv" }),
    );
    return;
  }

  downloadBlob(
    `${safeName}.resea`,
    await buildProjectBundle(project, exportedAt),
  );
}

export async function importProjectFile(file: File): Promise<ProjectState> {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error("This project is larger than the 1 GB import limit.");
  }
  let raw: string;
  let manifestProjectId: string | undefined;
  if (file.name.endsWith(".resea") || file.type === "application/zip") {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const names = Object.keys(zip.files);
    if (names.length > MAX_ARCHIVE_ENTRIES) {
      throw new Error("This bundle contains too many files to inspect safely.");
    }
    if (
      names.some(
        (name) =>
          name.startsWith("/") ||
          name.split("/").some((segment) => segment === ".."),
      )
    ) {
      throw new Error("This bundle contains an unsafe file path.");
    }
    const entry = zip.file("project.json");
    if (!entry) throw new Error("This bundle does not contain project.json.");
    raw = await entry.async("string");
    const manifestEntry = zip.file("manifest.json");
    if (!manifestEntry) {
      throw new Error("This bundle does not contain a verification manifest.");
    }
    const manifest = JSON.parse(await manifestEntry.async("string")) as {
      format?: string;
      formatVersion?: string;
      compatibleProjectSchema?: string;
      projectId?: string;
      projectSha256?: string;
      checksumsSha256?: string;
    };
    const compatibleFormat =
      manifest.formatVersion === "1.0.0" ||
      (manifest.formatVersion === "1.1.0" &&
        manifest.compatibleProjectSchema === "1.0.0");
    if (
      manifest.format !== "resea-project" ||
      !compatibleFormat ||
      !manifest.projectId ||
      !manifest.projectSha256
    ) {
      throw new Error("This bundle has an incompatible verification manifest.");
    }
    manifestProjectId = manifest.projectId;
    if ((await sha256(raw)) !== manifest.projectSha256) {
      throw new Error("Bundle integrity check failed.");
    }
    if (manifest.checksumsSha256) {
      const checksumsEntry = zip.file("checksums.json");
      if (!checksumsEntry) {
        throw new Error("This bundle is missing its artifact checksums.");
      }
      const checksumsRaw = await checksumsEntry.async("string");
      if ((await sha256(checksumsRaw)) !== manifest.checksumsSha256) {
        throw new Error("Artifact checksum manifest failed verification.");
      }
      const checksums = JSON.parse(checksumsRaw) as {
        algorithm?: string;
        files?: Record<string, string>;
      };
      if (
        checksums.algorithm !== "SHA-256" ||
        !checksums.files ||
        typeof checksums.files !== "object"
      ) {
        throw new Error("This bundle has an invalid artifact checksum manifest.");
      }
      for (const [path, expectedHash] of Object.entries(checksums.files)) {
        if (
          path.startsWith("/") ||
          path.split("/").some((segment) => segment === "..") ||
          !/^[a-f0-9]{64}$/.test(expectedHash)
        ) {
          throw new Error("This bundle has an invalid artifact checksum entry.");
        }
        const artifactEntry = zip.file(path);
        if (!artifactEntry) {
          throw new Error(`Bundle artifact is missing: ${path}.`);
        }
        const artifactRaw = path === "project.json"
          ? raw
          : await artifactEntry.async("string");
        if ((await sha256(artifactRaw)) !== expectedHash) {
          throw new Error(`Bundle artifact integrity check failed: ${path}.`);
        }
      }
    }
  } else {
    raw = await file.text();
  }
  if (raw.length > MAX_PROJECT_JSON_CHARACTERS) {
    throw new Error("This project exceeds the 100 MB JSON limit.");
  }
  const decoded = JSON.parse(raw) as Partial<ProjectState> & {
    project?: Partial<ProjectState>;
  };
  const parsed: Partial<ProjectState> = decoded.project ?? decoded;
  if (
    parsed.schemaVersion !== "1.0.0" ||
    !parsed.id ||
    !parsed.spec ||
    typeof parsed.spec.title !== "string" ||
    !Array.isArray(parsed.assumptions) ||
    !parsed.researchPlan ||
    !Array.isArray(parsed.sources) ||
    !Array.isArray(parsed.evidence) ||
    !Array.isArray(parsed.claims) ||
    !Array.isArray(parsed.concepts) ||
    !Array.isArray(parsed.outcomes) ||
    !Array.isArray(parsed.modules) ||
    !Array.isArray(parsed.versions) ||
    !Array.isArray(parsed.events)
  ) {
    throw new Error("This is not a compatible Resea 1.0 project.");
  }
  if (manifestProjectId && parsed.id !== manifestProjectId) {
    throw new Error("The bundle manifest does not match its project.");
  }
  return parsed as ProjectState;
}
