# Deploying the app to app.liveunmute.com

You already have `liveunmute.com` on Netlify. A subdomain is a **second Netlify
site**, not a folder on the first one. Netlify cannot serve two different
publish directories from one site, so `app.liveunmute.com` gets its own site,
pointing at the same GitHub repo but a different build directory.

Everything below is done in the Netlify dashboard. It takes about five minutes
plus DNS propagation.

---

## The trap to avoid first

The **repo root** has a `netlify.toml` that builds `demo/`:

```toml
[build]
  base    = "demo"
  command = "npm install --omit=dev && npm run setup && npm run build"
  publish = "dist"
```

If you create the new site and connect it to this repo **without setting a base
directory**, Netlify reads that file and builds the MediaPipe demo instead of
the app. You get a working site that is the wrong thing.

`app/netlify.toml` exists to prevent this. It has no `base` of its own — it
only takes effect once the site's Base directory is `app`.

---

## 1. Create the site

Netlify dashboard → **Add new site → Import an existing project → GitHub** →
`LiveUnmute/unmute-sign`.

Then, **before clicking Deploy**, set:

| Field | Value |
|---|---|
| Branch to deploy | `main` (or `arena/fcc551fe-unmute-sign` if that is what you want live) |
| **Base directory** | `app` |
| Build command | *(leave empty)* |
| Publish directory | `.` |

Base directory `app` is the one that matters. Build command empty and publish
`.` mean Netlify serves the `app/` folder as-is.

Deploy. You get a URL like `https://unmute-app.netlify.app`. Check it works
before touching DNS — if the URL is broken, the domain will be too.

---

## 2. Point the subdomain at it

On the **new** site: **Domain management → Add a domain →** type
`app.liveunmute.com` → **Verify**.

What happens next depends on where your DNS lives.

### If liveunmute.com uses Netlify DNS

Netlify already hosts the zone, so it creates the `app` CNAME itself. Nothing
else to do — HTTPS is issued automatically within a few minutes.

You can confirm in **Domain management → Netlify DNS** that a record exists:

```
app    CNAME    unmute-app.netlify.app
```

### If your DNS is at your registrar, Cloudflare, or elsewhere

Netlify shows you the target. Add this record wherever your DNS is hosted:

| Type | Name | Value | TTL |
|---|---|---|---|
| `CNAME` | `app` | `unmute-app.netlify.app` | Auto / 3600 |

Use the exact target Netlify shows you — yours will differ from the placeholder
above.

**If you use Cloudflare:** set the record to **DNS only** (grey cloud, not the
orange one). Cloudflare's proxy sits in front of Netlify's certificate
challenge and HTTPS will fail to provision. You can turn the proxy back on
afterwards if you want, but the simplest working state is DNS-only.

---

## 3. Verify

Wait for DNS (usually under ten minutes; up to an hour), then:

```bash
dig +short app.liveunmute.com
```

You should get Netlify's addresses. Then open `https://app.liveunmute.com` in a
private window — a cached redirect from a previous test is the most common
false alarm.

In Netlify, **Domain management** should show the domain with a green
**Netlify DNS** or **HTTPS** badge, not "Awaiting external DNS".

---

## Two things not to do

**Do not add `app.liveunmute.com` to the existing landing-page site.** It will
become an alias for that site's content and serve the landing page at the app
address.

**Do not set the new site's base directory to the repo root** and try to
publish `app` from there. The root `netlify.toml` wins and you get `demo/`.

---

## What is live at that address

| Path | Serves |
|---|---|
| `/` | The board — four screens side by side on desktop; **the app itself on a phone** |
| `/app` | The app, always framed, even on desktop |
| `/app.html` | Same, the long way round |

So a tester opening `app.liveunmute.com` on their phone gets the app directly,
with no chrome and no frame. That is the link to hand out.

If you would rather `/` always be the app — no board on desktop — change one
line at the top of `app/js/app.js`:

```js
// const isMobile = () => window.matchMedia("(max-width: 640px)").matches;
const isMobile = () => true;
```

---

## Command line, if you prefer

```bash
npm install -g netlify-cli
netlify login

cd app
netlify init            # link to the new site
netlify deploy --prod --dir .
```

That pushes the built folder directly and skips Git. It is faster for a
one-off, but the site then has no continuous deploy — every future change
needs the command again. For a link you are sending to testers, use the Git
connection so a push updates the URL.

---

## After the first deploy

- **Swapping a sign image or adding a video** is still a one-string edit in
  `app/js/media.js`. Media is cached for a day (`/media/*` in
  `app/netlify.toml`); if a swapped file does not appear, rename it — a new
  filename is a new URL and skips the cache.
- **HTML is never cached**, so a redeploy is picked up on reload. JS and CSS
  are cached for five minutes.
- The landing page can link to it with `.cta-pill` pointing at
  `https://app.liveunmute.com`.
