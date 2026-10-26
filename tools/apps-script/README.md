# Unmute form relay — setup

> This folder is deliberately outside `landing/`. It holds folder IDs and the
> notification address for the owner, not for the public site, and anything
> under `landing/` is published.

The landing page is static, so something has to accept the two forms and write
them into Drive. That something is a Google Apps Script web app running in your
own Google account. No credentials go into the website, and nothing is sent to
a third-party form service.

## Where the data goes

| Form | Destination | Email |
|---|---|---|
| Waitlist dialog | A Sheet named **Unmute — Waitlist** in `01 Unmute / 09 Waitlist` | **None** — silent |
| Letter of intent | A Google Doc in `01 Unmute / 10 Letters of Intent` | **Yes** — link emailed to `contact@liveunmute.com` |

Folder IDs are already filled in at the top of `Code.gs`:

- `09 Waitlist` → `1YQEvfz3DDsB4frSZ7NJCP9zrPNg9wGl1`
- `10 Letters of Intent` → `1zGcjM_sX61sGqkkveifYudVZJfDC1s0P`

Both were created inside `01 Unmute`. The IDs travel with the folders, so moving
a folder inside Drive is safe; deleting it is not.

## Deploy it (once, ~5 minutes)

1. Open <https://script.google.com> → **New project**
2. Replace the contents of `Code.gs` with the file here and **Save**
3. **Deploy → New deployment →** gear icon **→ Web app**
   - Description: `Unmute relay`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. **Deploy**, then authorise. Approve the Drive + Gmail scopes.
5. Copy the **Web app URL** (it ends in `/exec`)
6. Paste it into `landing/assets/js/config.js`:

   ```js
   window.UNMUTE_CONFIG = {
     relayUrl: 'https://script.google.com/macros/s/AKfy…/exec',
     inbox: 'contact@liveunmute.com',
   };
   ```

## Check it

Open the `/exec` URL in a browser. You should see:

```json
{"ok":true,"service":"unmute-relay","version":1}
```

That GET is a health check only — it writes nothing and sends nothing.

## Updating

Editing `Code.gs` in the browser is not enough. Go to
**Deploy → Manage deployments →** pencil → **Version: New version → Deploy**.
Without a new version the old code keeps serving, which is the single most
common source of "my change did nothing".

## Quotas and limits

- Gmail: 100 recipients/day on a consumer account, 1,500 on Workspace
- Drive: subject to normal storage
- Web app: 20,000 URL fetches/day

Well beyond a waitlist.

## If the forms stop arriving

1. Open the `/exec` URL — if it does not return the JSON above, redeploy
2. **Executions** in the Apps Script sidebar shows every POST and any error
3. Check the folder still exists and the ID still matches
4. Confirm the script runs in the account that owns the folders — a deployment
   in another account cannot see them

## Why the page cannot read the reply

The site posts with `mode: 'no-cors'` and a `text/plain` body. That keeps it a
"simple" request, so the browser sends no preflight — Apps Script rejects
preflights. The trade-off is that the browser cannot read the response, so the
page confirms optimistically and the email is the real receipt. A single
request is sent, so nothing is ever written twice.
