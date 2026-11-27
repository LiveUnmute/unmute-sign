// One source of truth for the product-demo page and its small brand assets.
//
// demo/pitch/ is copied to /demo by the demo build. app/demo/ is a committed
// copy because app.liveunmute.com can also be deployed by dragging app/ to
// Netlify, without a build step.
//
//     node tools/sync-pitch-page.mjs          # write the app copy
//     node tools/sync-pitch-page.mjs --check  # fail if it has drifted

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, "demo/pitch");
const DST = join(ROOT, "app/demo");
const check = process.argv.includes("--check");

function filesUnder(relative) {
  return readdirSync(join(SRC, relative), { withFileTypes: true }).flatMap((entry) => {
    const path = join(relative, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

const files = ["index.html", ...filesUnder("assets")];
let drift = false;
for (const file of files) {
  const src = join(SRC, file);
  const dst = join(DST, file);
  if (check) {
    if (!existsSync(dst) || !readFileSync(dst).equals(readFileSync(src))) {
      console.error(`FAIL  ${dst} is missing or differs from ${src}`);
      drift = true;
    }
  } else {
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }
}

if (drift) {
  console.error("Run node tools/sync-pitch-page.mjs to update the app copy.");
  process.exitCode = 1;
} else if (check) {
  console.log(`PASS  ${DST} matches ${SRC} (${files.length} files)`);
} else {
  console.log(`Synced ${files.length} files from ${SRC} to ${DST}`);
}
