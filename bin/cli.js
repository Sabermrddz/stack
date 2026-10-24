#!/usr/bin/env node
/**
 * my-stack v2 CLI
 * Usage: npx my-stack <project-name> [--stack=mongo|postgres|appwrite]
 */

import {
  access,
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, "..", "template");
const DOCS_DIR = path.resolve(__dirname, "..", "docs");

const VALID_STACKS = ["mongo", "postgres", "appwrite"];

// Files excluded from every cp() call.
const EXCLUDED_ENTRIES = new Set([
  "node_modules",
  ".next",
  ".git",
  "package-lock.json",
  "tsconfig.tsbuildinfo",
  "drizzle", // only in db-postgres overlay; never copy the (empty) placeholder dir
]);

const INVALID_NAME_CHARS = /[\\/:*?"<>|]/;

// ─── helpers ─────────────────────────────────────────────────────────────────

function usage() {
  return `Usage:
  my-stack <project-name> [--stack=mongo|postgres|appwrite]
  my-stack --help     Show this help
  my-stack --version  Show the CLI version

Stacks:
  mongo      Next.js + Better-Auth + MongoDB/Mongoose + Backblaze B2
  postgres   Next.js + Better-Auth + Neon/PostgreSQL/Drizzle + Backblaze B2
  appwrite   Next.js + Appwrite (auth, TablesDB, storage)

All stacks include: TypeScript, Tailwind, ESLint, Zod env validation,
Cloudflare Turnstile on public forms, and an internal rate limiter.`;
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
    if (err && err.code === "ENOENT") return false;
    throw err;
  }
}

async function isDirEmpty(target) {
  try {
    const entries = await readdir(target);
    return entries.length === 0;
  } catch {
    return true;
  }
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function cpFilter(src) {
  return !EXCLUDED_ENTRIES.has(path.basename(src));
}

// ─── overlay merging ─────────────────────────────────────────────────────────

/**
 * Deep-merge two parsed package.json objects.
 * Arrays (like "scripts") are merged by key, not replaced.
 */
function mergePkg(base, overlay) {
  const result = { ...base };
  for (const key of Object.keys(overlay)) {
    if (
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key]) &&
      typeof overlay[key] === "object" &&
      !Array.isArray(overlay[key])
    ) {
      result[key] = { ...result[key], ...overlay[key] };
    } else {
      result[key] = overlay[key];
    }
  }
  return result;
}

/**
 * Append lines from overlayContent into baseContent, skipping blank-line-only
 * duplicates at the section boundary.
 */
function mergeEnvExample(baseContent, overlayContent) {
  const base = baseContent.trimEnd();
  const extra = overlayContent.trimStart();
  if (!extra) return base + "\n";
  return base + "\n\n" + extra + "\n";
}

async function copyOverlay(overlayName, targetDir) {
  const overlayDir = path.join(TEMPLATE_DIR, overlayName);
  if (!(await exists(overlayDir))) {
    throw new Error(`Overlay directory not found: ${overlayDir}`);
  }
  await cp(overlayDir, targetDir, { recursive: true, filter: cpFilter });
}

async function mergeFiles(overlayName, targetDir) {
  const overlayDir = path.join(TEMPLATE_DIR, overlayName);

  // Merge package.json
  const overlayPkgPath = path.join(overlayDir, "package.json");
  if (await exists(overlayPkgPath)) {
    const targetPkgPath = path.join(targetDir, "package.json");
    const base = JSON.parse(await readFile(targetPkgPath, "utf8"));
    const overlay = JSON.parse(await readFile(overlayPkgPath, "utf8"));
    const merged = mergePkg(base, overlay);
    await writeFile(targetPkgPath, JSON.stringify(merged, null, 2) + "\n");
  }

  // Merge .env.example
  const overlayEnvPath = path.join(overlayDir, ".env.example");
  if (await exists(overlayEnvPath)) {
    const targetEnvPath = path.join(targetDir, ".env.example");
    const base = (await exists(targetEnvPath))
      ? await readFile(targetEnvPath, "utf8")
      : "";
    const overlay = await readFile(overlayEnvPath, "utf8");
    await writeFile(targetEnvPath, mergeEnvExample(base, overlay));
  }

  // env.ts: copied wholesale by cp() — the last overlay wins.
  // No append needed; each stack overlay ships a complete standalone env.ts.
}

// ─── per-stack composition ───────────────────────────────────────────────────

/** Layers to apply IN ORDER per stack. Each entry = { overlay, mergeOnly }
 *  mergeOnly: skip cp() of source files — only merge package.json / .env.example.
 *  (We always cp the src files first, then merge manifests in a second pass.)
 */
const STACK_LAYERS = {
  mongo: [
    { overlay: "base" },
    { overlay: "auth-betterauth" },
    { overlay: "storage-b2" },
    { overlay: "rate-limit-mongo" },
    { overlay: "db-mongo" },
  ],
  postgres: [
    { overlay: "base" },
    { overlay: "auth-betterauth" },
    { overlay: "storage-b2" },
    { overlay: "rate-limit-postgres" },
    { overlay: "db-postgres" },
  ],
  appwrite: [
    { overlay: "base" },
    { overlay: "backend-appwrite" },
    { overlay: "rate-limit-appwrite" },
  ],
};

// ─── next-steps text ─────────────────────────────────────────────────────────

function nextStepsText(projectName, stack) {
  const docRef = {
    mongo: "docs/OAUTH.md, docs/CLOUDFLARE.md, docs/BACKBLAZE.md, docs/FREE-TIERS.md",
    postgres:
      "docs/OAUTH.md, docs/CLOUDFLARE.md, docs/BACKBLAZE.md, docs/POSTGRES.md, docs/FREE-TIERS.md",
    appwrite: "docs/APPWRITE.md, docs/CLOUDFLARE.md, docs/FREE-TIERS.md",
  }[stack];

  return `
Done! ✔ Created ${projectName}/ with the ${stack} stack.

Next steps:

  cd ${projectName}
  npm install
  cp .env.example .env   # then fill in every value — see docs/ for instructions
  npm run dev

Before sign-in / uploads will work, complete the manual setup in:
  ${docRef}

For env validation skip during build:  SKIP_ENV_VALIDATION=1 npm run build
`;
}

// ─── README generator ────────────────────────────────────────────────────────

const STACK_README = {
  mongo: `# {{PROJECT_NAME}} — mongo stack

Scaffolded by **my-stack v2**.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Better-Auth** (email/password + Google + GitHub OAuth)
- **MongoDB** via Mongoose (MongoDB Atlas M0 free tier)
- **Backblaze B2** file uploads (presigned S3-compatible URLs)
- Internal rate limiter (Mongo TTL-indexed records)
- Cloudflare Turnstile on public forms

## Env keys

| Key | Description |
|-----|-------------|
| \`MONGODB_URI\` | MongoDB Atlas connection string |
| \`BETTER_AUTH_SECRET\` | Random ≥32-char secret |
| \`BETTER_AUTH_URL\` | App base URL |
| \`GITHUB_CLIENT_ID/SECRET\` | GitHub OAuth app |
| \`GOOGLE_CLIENT_ID/SECRET\` | Google OAuth client |
| \`NEXT_PUBLIC_TURNSTILE_SITE_KEY\` | Cloudflare Turnstile site key |
| \`TURNSTILE_SECRET_KEY\` | Cloudflare Turnstile secret |
| \`B2_KEY_ID / B2_APPLICATION_KEY\` | Backblaze B2 application key |
| \`B2_BUCKET / B2_ENDPOINT / B2_REGION\` | Backblaze B2 bucket config |

## Manual setup
See \`docs/\` for step-by-step guides for each service.

## Free tier notes
- MongoDB Atlas M0: 512 MB storage, shared cluster, no time limit
- Backblaze B2: first 10 GB storage + 1 GB/day download free
- Cloudflare Turnstile: unlimited, always free
`,
  postgres: `# {{PROJECT_NAME}} — postgres stack

Scaffolded by **my-stack v2**.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Better-Auth** with Drizzle adapter (email/password + Google + GitHub OAuth)
- **Neon** PostgreSQL (serverless, free tier) + **Drizzle ORM**
- **Backblaze B2** file uploads (presigned S3-compatible URLs)
- Internal rate limiter (SQL-based sliding window)
- Cloudflare Turnstile on public forms

## Env keys

| Key | Description |
|-----|-------------|
| \`DATABASE_URL\` | Neon pooled connection string |
| \`DATABASE_URL_UNPOOLED\` | Neon direct connection (for migrations) |
| \`BETTER_AUTH_SECRET\` | Random ≥32-char secret |
| \`BETTER_AUTH_URL\` | App base URL |
| \`GITHUB_CLIENT_ID/SECRET\` | GitHub OAuth app |
| \`GOOGLE_CLIENT_ID/SECRET\` | Google OAuth client |
| \`NEXT_PUBLIC_TURNSTILE_SITE_KEY\` | Cloudflare Turnstile site key |
| \`TURNSTILE_SECRET_KEY\` | Cloudflare Turnstile secret |
| \`B2_KEY_ID / B2_APPLICATION_KEY\` | Backblaze B2 application key |
| \`B2_BUCKET / B2_ENDPOINT / B2_REGION\` | Backblaze B2 bucket config |

## Database migrations

\`\`\`bash
npm run db:generate   # generate SQL from schema
npm run db:migrate    # apply migrations against DATABASE_URL_UNPOOLED
\`\`\`

## Manual setup
See \`docs/\` for step-by-step guides for each service.

## Free tier notes
- Neon free: 0.5 GB storage, 190 compute hours/month, 1 project
- Backblaze B2: first 10 GB storage + 1 GB/day download free
- Cloudflare Turnstile: unlimited, always free
`,
  appwrite: `# {{PROJECT_NAME}} — appwrite stack

Scaffolded by **my-stack v2**.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Appwrite Cloud** for auth (email/password + OAuth), TablesDB, and Storage
- Internal rate limiter (lazy-cleanup Appwrite Storage counters)
- Cloudflare Turnstile on public forms

## Env keys

| Key | Description |
|-----|-------------|
| \`NEXT_PUBLIC_APPWRITE_ENDPOINT\` | Appwrite Cloud endpoint (https://cloud.appwrite.io/v1) |
| \`NEXT_PUBLIC_APPWRITE_PROJECT\` | Your Appwrite project ID |
| \`APPWRITE_API_KEY\` | Server-side Appwrite API key |
| \`APPWRITE_DATABASE_ID\` | TablesDB database ID |
| \`APPWRITE_BUCKET_ID\` | Storage bucket ID |
| \`NEXT_PUBLIC_TURNSTILE_SITE_KEY\` | Cloudflare Turnstile site key |
| \`TURNSTILE_SECRET_KEY\` | Cloudflare Turnstile secret |

## Manual setup
See \`docs/APPWRITE.md\` and \`docs/CLOUDFLARE.md\` for step-by-step guides.

## Free tier notes
- Appwrite Cloud free: 2 GB storage, 5 GB bandwidth/month, unlimited auth
- Projects paused after 1 week of inactivity — re-activate in console
- Cloudflare Turnstile: unlimited, always free
`,
};

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return;
  }

  if (args.includes("--version") || args.includes("-v")) {
    const pkg = JSON.parse(
      await readFile(path.resolve(__dirname, "..", "package.json"), "utf8")
    );
    console.log(pkg.version);
    return;
  }

  // Parse project name and optional --stack flag
  let projectName = "";
  let stack = "";

  for (const arg of args) {
    if (arg.startsWith("--stack=")) {
      stack = arg.slice("--stack=".length).toLowerCase().trim();
    } else if (!arg.startsWith("--")) {
      projectName = arg.trim();
    }
  }

  // Validate project name
  if (!projectName) {
    console.error(usage());
    process.exit(1);
  }

  if (!projectName || projectName === "." || projectName === "..") {
    fail(`"${projectName}" is not a valid project name.`);
  }

  if (INVALID_NAME_CHARS.test(projectName)) {
    fail(
      `"${projectName}" must not contain path separators or reserved characters (\\ / : * ? " < > |).`
    );
  }

  if (projectName.startsWith(".")) {
    fail(`"${projectName}" must not start with a dot.`);
  }

  // Validate or prompt for stack
  if (stack && !VALID_STACKS.includes(stack)) {
    fail(`Unknown stack "${stack}". Choose one of: ${VALID_STACKS.join(", ")}.`);
  }

  if (!stack) {
    console.log("\nWhich stack do you want to scaffold?\n");
    console.log("  1) mongo    — Better-Auth + MongoDB/Mongoose + Backblaze B2");
    console.log("  2) postgres — Better-Auth + Neon/PostgreSQL/Drizzle + Backblaze B2");
    console.log("  3) appwrite — Appwrite (auth, TablesDB, storage)\n");
    const answer = await prompt("Enter 1, 2, 3 or a stack name: ");
    const map = { "1": "mongo", "2": "postgres", "3": "appwrite" };
    stack = map[answer] ?? answer.toLowerCase().trim();
    if (!VALID_STACKS.includes(stack)) {
      fail(`Unknown stack "${stack}". Choose one of: ${VALID_STACKS.join(", ")}.`);
    }
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Refuse to overwrite non-empty folders
  if (await exists(targetDir)) {
    if (!(await isDirEmpty(targetDir))) {
      fail(
        `"${targetDir}" already exists and is not empty. Choose a different project name.`
      );
    }
  } else {
    await mkdir(targetDir, { recursive: true });
  }

  console.log(`\nScaffolding ${projectName}/ with the ${stack} stack…\n`);

  const layers = STACK_LAYERS[stack];

  // 1. Copy source files from base first
  await copyOverlay(layers[0].overlay, targetDir);

  // 2. Copy and merge remaining layers
  for (let i = 1; i < layers.length; i++) {
    const { overlay } = layers[i];
    
    // Copy all files EXCEPT package.json and .env.example (we'll merge those)
    const overlayDir = path.join(TEMPLATE_DIR, overlay);
    if (await exists(overlayDir)) {
      const entries = await readdir(overlayDir);
      for (const entry of entries) {
        if (entry === 'package.json' || entry === '.env.example') continue;
        if (EXCLUDED_ENTRIES.has(entry)) continue;
        
        const src = path.join(overlayDir, entry);
        const dest = path.join(targetDir, entry);
        const srcStat = await stat(src);
        
        if (srcStat.isDirectory()) {
          await cp(src, dest, { recursive: true, filter: cpFilter });
        } else {
          await cp(src, dest);
        }
      }
    }
    
    // Now merge the manifests
    await mergeFiles(overlay, targetDir);
  }

  // 3. Rename _gitignore → .gitignore
  const gitignoreSrc = path.join(targetDir, "_gitignore");
  if (await exists(gitignoreSrc)) {
    await rename(gitignoreSrc, path.join(targetDir, ".gitignore"));
  }

  // 4. Set project name in package.json
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = projectName;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // 5. Generate project README
  const readme = (STACK_README[stack] ?? "").replace(
    /\{\{PROJECT_NAME\}\}/g,
    projectName
  );
  await writeFile(path.join(targetDir, "README.md"), readme);

  // 6. Copy docs
  if (await exists(DOCS_DIR)) {
    await cp(DOCS_DIR, path.join(targetDir, "docs"), {
      recursive: true,
      filter: cpFilter,
    });
  }

  console.log(nextStepsText(projectName, stack));
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
