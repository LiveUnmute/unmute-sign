// Assembles a self-contained static site into ./dist for deployment.
//
// Why this exists: the app needs the MediaPipe runtime in ./vendor, which is
// gitignored. Connecting Netlify straight to the repo would publish a site
// that loads but cannot track hands. This build runs in Netlify's build step
// and produces a directory that contains everything.

import { mkdir, rm, cp, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const SRC = ".";
const DIST = "dist";

const COPY_FILES = ["index.html", "onepager.html"];
const COPY_DIRS = ["css", "js"];

async function dirSize(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    total += entry.isDirectory() ? await dirSize(p) : (await stat(p)).size;
  }
  return total;
}

const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

for (const f of COPY_FILES) {
  if (!existsSync(f)) throw new Error(`Missing ${f}`);
  await cp(f, join(DIST, f));
}

for (const d of COPY_DIRS) {
  if (!existsSync(d)) throw new Error(`Missing ${d}/`);
  await cp(d, join(DIST, d), { recursive: true });
}

// The test directory lives inside js/ only if someone put it there; keep the
// deployed site free of test files regardless.
await rm(join(DIST, "js", "test"), { recursive: true, force: true });
for (const stray of ["__test_app.mjs", "__t2.mjs"]) {
  await rm(join(DIST, "js", stray), { force: true });
}

if (!existsSync("vendor")) {
  throw new Error(
    "vendor/ is missing. Run `npm install && npm run setup` before building."
  );
}
await cp("vendor", join(DIST, "vendor"), { recursive: true });

// Netlify honours this file next to the published content.
await writeFile(
  join(DIST, "_headers"),
  `# Content-hashed runtime never changes: cache hard.
/vendor/wasm/*
  Cache-Control: public, max-age=31536000, immutable

# Everything else must revalidate, so a fix is never invisible.
/*
  Cache-Control: no-store, must-revalidate
  X-Content-Type-Options: nosniff
`
);

const total = await dirSize(DIST);
console.log(`dist/ built — ${mb(total)}`);
console.log("Deploy this directory (drag the folder or the zip into Netlify).");
