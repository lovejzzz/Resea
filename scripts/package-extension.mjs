import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const source = join(root, "apps/extension");
const target = join(root, "dist-extension");
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log(`Extension package prepared at ${target}`);
