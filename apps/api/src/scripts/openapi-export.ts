import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../app.js";
import { loadConfig } from "../config.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const output = process.argv[2] ? (isAbsolute(process.argv[2]) ? process.argv[2] : resolve(packageRoot, process.argv[2])) : resolve(packageRoot, "openapi.json");

async function main(): Promise<void> {
  const config = loadConfig({ ...process.env, DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres@localhost:5432/app" });
  const app = await buildApp(config, { exportMode: true });
  try {
    await app.ready();
    const document = app.swagger();
    if (!document.paths?.["/api/projects/"]) throw new Error("OpenAPI document is missing project routes");
    await mkdir(dirname(output), { recursive: true });
    const temporaryOutput = `${output}.tmp`;
    await writeFile(temporaryOutput, `${JSON.stringify(document, null, 2)}\n`, "utf8");
    await rename(temporaryOutput, output);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
