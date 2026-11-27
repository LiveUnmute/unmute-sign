// How the two forms reach Google Drive.
//
// The relay lives in ../tools/apps-script: it is setup material for the
// owner, not part of the published site, so it must not sit in the web root.
//
// The rule under test is asymmetric and deliberate: a waitlist signup is
// written silently, and only a letter of intent notifies anyone. The other
// rule is that a browser must never send credentials for Drive — the page
// posts to a relay that already lives inside the Google account.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const indexHtml = readFileSync("./index.html", "utf8");
const loiHtml = readFileSync("./loi.html", "utf8");
const configJs = readFileSync("./assets/js/config.js", "utf8");
const scriptGs = readFileSync("../tools/apps-script/Code.gs", "utf8");

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

// --- client wiring ---

ok("both pages load the shared config", () => {
  for (const [name, html] of [["index.html", indexHtml], ["loi.html", loiHtml]]) {
    assert.ok(html.includes('<script src="assets/js/config.js"></script>'), `${name} does not load config.js`);
  }
});

ok("the config carries a relay URL and an inbox, and ships unset", () => {
  assert.match(configJs, /relayUrl:\s*''/, "relayUrl should ship empty until deployed");
  assert.match(configJs, /inbox:\s*'contact@liveunmute\.com'/);
});

ok("no credentials, keys or tokens are shipped to the browser", () => {
  for (const [name, src] of [["index.html", indexHtml], ["loi.html", loiHtml], ["config.js", configJs]]) {
    assert.ok(!/private_key|client_secret|refresh_token|Bearer\s+[A-Za-z0-9._-]{20,}/.test(src),
      `${name} contains something credential-shaped`);
  }
});

ok("submissions are posted as simple requests, avoiding a preflight", () => {
  // Apps Script rejects preflights, so the body has to be text/plain and the
  // mode has to be no-cors.
  for (const [name, src] of [["index.html", indexHtml], ["loi.html", loiHtml]]) {
    assert.match(src, /mode:\s*'no-cors'/, `${name} does not use no-cors`);
    assert.match(src, /'Content-Type':\s*'text\/plain;charset=utf-8'/, `${name} uses a non-simple content type`);
  }
});

ok("a failed post is never retried, so nothing is written twice", () => {
  for (const [name, src] of [["index.html", indexHtml], ["loi.html", loiHtml]]) {
    const body = src.slice(src.indexOf("postToRelay"));
    const fn = body.slice(0, body.indexOf("\n  }") + 4);
    assert.ok(!/retry|for\s*\(|while\s*\(/.test(fn), `${name} retries the post`);
  }
});

ok("each form declares which kind it is", () => {
  assert.match(indexHtml, /kind:\s*'waitlist'/);
  assert.match(loiHtml, /kind:\s*'loi'/);
});

ok("with no relay configured, both forms fall back to email", () => {
  assert.match(indexHtml, /if \(!WAITLIST_ENDPOINT\)/);
  assert.match(loiHtml, /if \(!LOI_ENDPOINT\)/);
});

// --- relay behaviour ---

ok("the relay routes waitlist and LOI separately", () => {
  assert.match(scriptGs, /function handleWaitlist/);
  assert.match(scriptGs, /function handleLoi/);
  assert.match(scriptGs, /kind === 'loi'/);
});

ok("the relay writes into the two folders created in 01 Unmute", () => {
  assert.match(scriptGs, /WAITLIST_FOLDER_ID = '1YQEvfz3DDsB4frSZ7NJCP9zrPNg9wGl1'/);
  assert.match(scriptGs, /LOI_FOLDER_ID = '1zGcjM_sX61sGqkkveifYudVZJfDC1s0P'/);
});

ok("only the letter of intent sends mail", () => {
  // Exactly one sendEmail in the whole script, and it lives in handleLoi.
  const sends = scriptGs.match(/MailApp\.sendEmail/g) || [];
  assert.equal(sends.length, 1, `found ${sends.length} sends; the waitlist must be silent`);

  const loiAt = scriptGs.indexOf("function handleLoi");
  const waitlistAt = scriptGs.indexOf("function handleWaitlist");
  const sendAt = scriptGs.indexOf("MailApp.sendEmail");
  assert.ok(sendAt > loiAt, "the send is not inside the LOI path");
  assert.ok(!(sendAt > waitlistAt && sendAt < loiAt), "the send sits in the waitlist path");
});

ok("the emailed link points at the saved document", () => {
  assert.match(scriptGs, /MailApp\.sendEmail\(\{[\s\S]*?to:\s*INBOX/);
  assert.match(scriptGs, /docs\.google\.com\/document\/d\/' \+ docId/);
  assert.match(scriptGs, /INBOX = 'contact@liveunmute\.com'/);
});

ok("a GET is a health check and writes nothing", () => {
  const get = scriptGs.slice(scriptGs.indexOf("function doGet"));
  const body = get.slice(0, get.indexOf("\n}"));
  assert.ok(!/appendRow|create|sendEmail|moveTo/.test(body), "doGet has side effects");
  assert.match(body, /ok: true/);
});

ok("anything arriving from a form is treated as text", () => {
  assert.match(scriptGs, /function clean\(value\)/);
  assert.match(scriptGs, /String\(value\)\.trim\(\)\.slice\(0,\s*2000\)/);
});

ok("a deleted folder fails loudly instead of swallowing the submission", () => {
  assert.match(scriptGs, /function folderOrThrow/);
  assert.match(scriptGs, /Cannot open folder/);
});

console.log(`\n${pass} passed`);
