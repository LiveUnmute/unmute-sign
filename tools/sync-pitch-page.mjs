// One source of truth for the pitch page.
//
// demo/pitch/index.html is the source. app/demo/index.html is a committed copy,
// because app.liveunmute.com is deployed by dragging the app/ folder — there is
// no build step there to copy it at deploy time.
//
//     node tools/sync-pitch-page.mjs          # write the copy
//     node tools/sync-pitch-page.mjs --check  # fail if they have drifted

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SRC = "demo/pitch/index.html";
const DST = "app/demo/index.html";

const src = readFileSync(SRC, "utf8");
const check = process.argv.includes("--check");

if (check) {
  if (!existsSync(DST)) {
    console.error(`FAIL  ${DST} is missing — run node tools/sync-pitch-page.mjs`);
    process.exit(1);
  }
  if (readFileSync(DST, "utf8") !== src) {
    console.error(`FAIL  ${DST} has drifted from ${SRC} — re-run the sync`);
    process.exit(1);
  }
  console.log(`PASS  ${DST} matches ${SRC}`);
} else {
  mkdirSync(dirname(DST), { recursive: true });
  writeFileSync(DST, src);
  console.log(`wrote ${DST} from ${SRC}`);
}
