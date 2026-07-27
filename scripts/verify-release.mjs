import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url);
const failures = [];

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !["node_modules", ".git", "dist", ".next", ".wrangler"].includes(entry.name))
      .map((entry) => {
        const path = join(dir, entry.name);
        return entry.isDirectory() ? files(path) : [path];
      }),
  );
  return nested.flat();
}

const rootPath = root.pathname;
const projectFiles = await files(rootPath);

for (const file of projectFiles) {
  const local = relative(rootPath, file);
  if (/app\/api\/|server\/api|express|fastify/i.test(local)) {
    failures.push(`Owned backend surface found: ${local}`);
  }
  if (/\.(ts|tsx|js|mjs|json|yml|yaml)$/.test(file)) {
    const text = await readFile(file, "utf8");
    if (/sk-[A-Za-z0-9_-]{20,}|gh[opsu]_[A-Za-z0-9]{20,}/.test(text)) {
      failures.push(`Credential-like token found: ${local}`);
    }
  }
}

const manifest = JSON.parse(
  await readFile(join(rootPath, "apps/extension/manifest.json"), "utf8"),
);
if (manifest.host_permissions?.length) {
  failures.push("Extension must not request install-time host permissions.");
}
if (!manifest.optional_host_permissions?.includes("https://*/*")) {
  failures.push("Extension host reach must remain optional and user-granted.");
}

const hosting = JSON.parse(
  await readFile(join(rootPath, ".openai/hosting.json"), "utf8"),
);
if (hosting.d1 || hosting.r2) {
  failures.push("Resea must not depend on hosted D1 or R2 storage.");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Release invariants passed across ${projectFiles.length} files.`);
