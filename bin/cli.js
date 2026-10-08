#!/usr/bin/env node

import { access, cp, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, "..", "template");

// Never ship build output or a stale lock file into new projects.
const EXCLUDED_ENTRIES = new Set([
  "node_modules",
  ".next",
  ".git",
  "package-lock.json",
  "tsconfig.tsbuildinfo",
]);

const INVALID_NAME_CHARS = /[\\/:*?"<>|]/;

function usage() {
  return `Usage:
  my-stack <project-name>   Scaffold a new project into <project-name>/
  my-stack --help           Show this help
  my-stack --version        Show the CLI version`;
}

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return false;
    }
    throw err;
  }
}

async function main() {
  const arg = process.argv[2];

  if (arg === "--help" || arg === "-h") {
    console.log(usage());
    return;
  }

  if (arg === "--version" || arg === "-v") {
    const pkg = JSON.parse(
      await readFile(path.resolve(__dirname, "..", "package.json"), "utf8"),
    );
    console.log(pkg.version);
    return;
  }

  if (!arg) {
    console.error(usage());
    process.exit(1);
  }

  const projectName = arg.trim();

  if (!projectName || projectName === "." || projectName === "..") {
    fail(`"${arg}" is not a valid project name.`);
  }

  if (INVALID_NAME_CHARS.test(projectName)) {
    fail(
      `"${projectName}" must not contain path separators or reserved characters (\\ / : * ? " < > |).`,
    );
  }

  if (projectName.startsWith(".")) {
    fail(`"${projectName}" must not start with a dot.`);
  }

  if (!(await exists(TEMPLATE_DIR))) {
    fail(`template directory not found at ${TEMPLATE_DIR}`);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (await exists(targetDir)) {
    fail(`${targetDir} already exists. Choose a different project name.`);
  }

  console.log(`Scaffolding ${projectName} in ${targetDir} ...`);

  await cp(TEMPLATE_DIR, targetDir, {
    recursive: true,
    filter: (src) => !EXCLUDED_ENTRIES.has(path.basename(src)),
  });

  // Ship the manual setup guides with every new project (if packaged).
  const docsDir = path.resolve(__dirname, "..", "docs");
  if (await exists(docsDir)) {
    await cp(docsDir, path.join(targetDir, "docs"), { recursive: true });
  }

  // The template ships `_gitignore` so npm/git don't apply it to the template
  // itself; new projects get a real `.gitignore` back.
  await access(path.join(targetDir, "_gitignore"));
  await rename(
    path.join(targetDir, "_gitignore"),
    path.join(targetDir, ".gitignore"),
  );

  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = projectName;
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(`
Done. Next steps:

  cd ${projectName}
  npm install
  cp .env.example .env   # then fill in every value (see docs/)
  npm run dev

Manual setup before sign-in/uploads work:
  docs/OAUTH.md       GitHub + Google OAuth apps
  docs/CLOUDFLARE.md  Cloudflare + Turnstile keys
  docs/API-KEYS.md    MongoDB + Arcjet keys
  docs/BACKBLAZE.md   Backblaze B2 bucket + keys
`);
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
