# Deploying the app to app.liveunmute.com

Written against the live state of the domain, checked October 2026.

## What is already true

I checked the DNS, so you don't have to guess:

| Thing | State |
|---|---|
| Domain bought at | Namecheap |
| Nameservers | `dns1.p07.nsone.net`, `dns2.p07.nsone.net`, `dns3.p07.nsone.net`, `dns4.p07.nsone.net` |
| What that means | **Your DNS is managed by Netlify, not Namecheap** |
| `liveunmute.com` | Live, serving the landing page |
| `app.liveunmute.com` | Does not exist yet (`ENOTFOUND`) |

The important line is the third one. Somewhere along the way the domain's
nameservers were pointed at Netlify DNS. **So you do not touch Namecheap for
this.** Nothing at Namecheap needs to change — not the nameservers, not an
"A" record, not the Advanced DNS panel. If you go to Namecheap and start
editing DNS records, you will be editing a zone that is no longer in use.

Everything happens in the Netlify dashboard.

---

## "It deployed to a weird netlify.app URL instead"

If the address you got looks like this:

```
https://6ae2869ccaa8d9ee61a9682a--liveunmute.netlify.app/
```

That is a **deploy preview**, not a site address. The `<hash>--` prefix means
Netlify built a branch preview of the site called `liveunmute`.

Two things follow, and they are both certain:

1. **A deploy preview can never carry a custom domain.** It is regenerated on
   every build; there is no stable address to point DNS at. Do not try.
2. **It does not mean the deploy failed.** It usually means the build was fine
   and the domain was simply never added.

Check the plain site address — drop the hash:

```
https://liveunmute.netlify.app/
```

If that serves the app, the deploy is correct and only step 2 is missing.

### Which site do I add the domain to?

Open both candidates and compare what they serve:

| The site serving... | Is it |
|---|---|
| The four-screen board | **The app site.** Add `app.liveunmute.com` here. |
| "Every Voice Deserves to Be Heard" | The landing site. **Do not** add it here — the app address would serve the marketing page. |

### Then

1. On the app site: **Domain management → Add a domain**
2. Enter `app.liveunmute.com` → **Verify** → **Add domain**
3. Accept the DNS record Netlify offers to create
4. Wait for the HTTPS badge, then open the address in a private window

If Netlify says **"domain is already in use"**, it is attached to the landing
site — remove it there first.

### And check the production branch

If only a *preview* built, the site's production branch may still be `main`,
which contains nothing but a README. Set it under
**Site configuration → Build & deploy → Branches** to
`arena/fcc551fe-unmute-sign`. Otherwise the working `netlify.app` address will
go blank after the next push.

### Turn off the Netlify badge

New sites show a "Build your own site with Netlify" bar at the bottom of every
page. **Site configuration → Build & deploy → Post processing → Netlify badge
→ disable.** On a link handed to a clinician or an investor, that badge reads as
"someone dragged a folder onto a free host".

---

## The two traps

### Trap 1 — `main` is empty

The repo's `main` branch contains only a `README.md`. The `app/` folder, the
landing page, everything else lives on the branch `arena/fcc551fe-unmute-sign`.

**If you deploy from `main`, the site will be blank.** Pick one of:

- **Set the deploy branch to `arena/fcc551fe-unmute-sign`** (fastest, no merge),
  or
- Merge that branch into `main` on GitHub first, then deploy from `main`.

### Trap 2 — the repo root builds the wrong thing

`netlify.toml` at the repo root builds `demo/`:

```toml
[build]
  base    = "demo"
  command = "npm install --omit=dev && npm run setup && npm run build"
  publish = "dist"
```

A new site connected without a base directory reads that file and publishes the
MediaPipe demo. The site will look like it worked, and it will be the wrong
content.

Setting **Base directory = `app`** is what fixes this, because it makes Netlify
read `app/netlify.toml` instead.

---

## Step 1 — create the second site

A subdomain is a **separate Netlify site**. Netlify cannot serve two publish
directories from one site, so this is a new site, not a setting on the old one.

1. Netlify dashboard → **Add new site** → **Import an existing project**
2. → **GitHub** → authorise if asked → choose **`LiveUnmute/unmute-sign`**
3. On the configuration screen, set exactly:

| Field | Value |
|---|---|
| Branch to deploy | `arena/fcc551fe-unmute-sign` |
| **Base directory** | `app` |
| Build command | *(leave empty)* |
| Publish directory | `.` |
| Functions directory | *(leave empty)* |

4. **Deploy site.**

You get a URL like `https://sparkly-panda-123456.netlify.app`. **Open it before
doing anything else.** It should show the four-screen board.

If it shows a 404, or a MediaPipe camera demo, stop — the base directory is
wrong. Fix it under **Site configuration → Build & deploy → Base directory**,
then redeploy.

Write down that `netlify.app` URL. You need it in step 2 only if the automatic
option fails.

---

## Step 2 — attach the subdomain

On the **new** site (not the landing one):

1. **Domain management** → **Add a domain**
2. Type `app.liveunmute.com` → **Verify** → **Add domain**

Because `liveunmute.com` is already a Netlify DNS zone in your account, Netlify
recognises it and offers to create the record for you. Accept that.

If it asks you to confirm a DNS record, it will be:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `app` | `your-site-name.netlify.app` |

Netlify adds it to the existing zone itself. There is no Namecheap step.

---

## Step 3 — wait for the certificate

Netlify requests an HTTPS certificate automatically once the DNS resolves.
Usually under a minute, occasionally a few hours.

In **Domain management**, the domain should end up with a green **HTTPS** badge.
While it says "Awaiting Netlify DNS" or shows a yellow warning, just wait —
that message is normal for the first few minutes and is not an error.

---

## Step 4 — verify properly

Open `https://app.liveunmute.com` **in a private window**. A normal window may
serve a cached redirect from an earlier test and make a working deploy look
broken.

You should see, on a desktop, the four screens side by side. On a phone, the
app itself — full bleed, no frame, no board.

To check from a terminal:

```bash
dig +short app.liveunmute.com
```

It should return Netlify addresses, not nothing.

---

## If it doesn't work

| Symptom | Cause | Fix |
|---|---|---|
| Site is blank / 404 | Deployed from `main`, which only has a README | Change the branch to `arena/fcc551fe-unmute-sign` and redeploy |
| Camera demo appears | Base directory not set to `app` | Set it, redeploy |
| CSS or images missing | Base directory right, but publish directory wrong | Publish must be `.`, not `app` |
| "Domain already in use" | You added it to the landing site instead of the new one | Remove it there, add it on the new site |
| HTTPS badge never turns green | DNS not yet propagated | Wait; check `dig +short app.liveunmute.com` |
| Landing page appears at the app address | The subdomain was added as an alias on the landing site | Remove it from that site |

---

## Which address does what

| Path | Serves |
|---|---|
| `/` | The board on desktop; **the app itself on a phone** |
| `/app` | The app, always framed, even on desktop |
| `/app.html` | Same, the long way round |

Hand testers `app.liveunmute.com` — on their phone they land straight in the
app.

If you want `/` to always be the app, with no board at all, change one line at
the top of `app/js/app.js`:

```js
// const isMobile = () => window.matchMedia("(max-width: 640px)").matches;
const isMobile = () => true;
```

---

## Keeping it up to date

With the Git connection, every push to the deploy branch rebuilds the site.

- **HTML** is never cached, so a redeploy shows on reload.
- **JS and CSS** cache for five minutes.
- **Sign images and video** cache for a day. If you swap a file and don't see
  the change, rename it — a new filename is a new URL and skips the cache.

---

## The no-Git fallback

If the Git connection gives you trouble, you can drag a folder onto Netlify
instead: **Add new site → Deploy manually**, then drag the `app` folder in.
It works, because the app has no build step.

The cost is that it never updates itself — every future change means dragging
the folder again, and the two copies drift. Use it to get a link today, then
switch to the Git connection when you have a minute.
