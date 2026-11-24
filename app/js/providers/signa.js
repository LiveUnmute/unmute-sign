// Signa AI — English text to an ASL avatar video.
//
// The Netlify function keeps SIGNA_KEY server-side and mints a short-lived
// client token. The browser then calls Signa's documented /v1/sign and
// /v1/sign/video endpoints directly, so video rendering is not constrained by
// Netlify's synchronous-function timeout. Signa output is not sign recognition.

const DEFAULTS = {
  baseUrl: "/api/signa",
  apiOrigin: "https://api.usesigna.org",
  timeoutMs: 45_000,
  maxTextChars: 300,
};

async function responseDetail(response) {
  const raw = await response.text().catch(() => "");
  if (!raw) return "";
  try {
    const json = JSON.parse(raw);
    return String(json?.message || json?.error || raw).slice(0, 220);
  } catch {
    return raw.slice(0, 220);
  }
}

function signaError(response, stage, detail) {
  const error = new Error(`Signa ${stage} ${response.status}: ${detail || "request failed"}`);
  error.status = response.status;
  return error;
}

function abortError() {
  const error = new Error("The operation was aborted.");
  error.name = "AbortError";
  return error;
}

function waitForAbortable(value, signal) {
  if (!signal) return Promise.resolve(value);
  if (signal.aborted) return Promise.reject(abortError());

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(abortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve(value).then(
      (result) => {
        signal.removeEventListener("abort", onAbort);
        resolve(result);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

export function createSignaProvider(config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  const baseUrl = String(cfg.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "");
  const apiOrigin = String(cfg.apiOrigin || DEFAULTS.apiOrigin).replace(/\/+$/, "");

  let cachedToken = "";
  let tokenExpiresAt = 0;
  let tokenRequest = null;

  async function getToken(forceRefresh = false, signal) {
    if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt - 20_000) return cachedToken;
    if (tokenRequest && !forceRefresh) return tokenRequest;

    tokenRequest = (async () => {
      const response = await fetch(`${baseUrl}/token`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: "{}",
        signal,
      });

      if (!response.ok) {
        throw signaError(response, "token", await responseDetail(response));
      }

      const result = await response.json();
      if (typeof result?.token !== "string" || !result.token.startsWith("ct_")) {
        throw new Error("Signa token endpoint returned no usable client token.");
      }

      cachedToken = result.token;
      const expires = Date.parse(result.expiresAt || "");
      tokenExpiresAt = Number.isFinite(expires) ? expires : Date.now() + 280_000;
      return cachedToken;
    })().finally(() => {
      tokenRequest = null;
    });

    return tokenRequest;
  }

  async function requestVideo(sentence, token, signal) {
    const authorization = `Bearer ${token}`;
    const signResponse = await fetch(`${apiOrigin}/v1/sign`, {
      method: "POST",
      headers: {
        authorization,
        "content-type": "application/json",
        accept: "application/vnd.signa.sgn",
      },
      body: JSON.stringify({ text: sentence, from: "en", to: "ase" }),
      signal,
    });

    if (!signResponse.ok) {
      throw signaError(signResponse, "sign", await responseDetail(signResponse));
    }

    const signedAnimation = await signResponse.arrayBuffer();
    if (!signedAnimation.byteLength) throw new Error("Signa returned no signed animation for this text.");

    const videoResponse = await fetch(`${apiOrigin}/v1/sign/video`, {
      method: "POST",
      headers: {
        authorization,
        "content-type": "application/octet-stream",
        accept: "video/mp4",
      },
      body: signedAnimation,
      signal,
    });

    if (!videoResponse.ok) {
      throw signaError(videoResponse, "video", await responseDetail(videoResponse));
    }

    const contentType = videoResponse.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("video/mp4")) {
      throw new Error("Signa did not return an MP4 video.");
    }

    const videoBlob = await videoResponse.blob();
    if (!videoBlob.size) throw new Error("Signa returned an empty video.");

    return {
      videoUrl: URL.createObjectURL(new Blob([videoBlob], { type: "video/mp4" })),
      durationMs: 0,
      source: "signa",
    };
  }

  return {
    name: "signa",
    vendor: "Signa AI",
    capabilities: {
      signToText: false,
      textToSign: true,
    },

    async signToText() {
      throw new Error("Signa AI does not recognise patient signing; it provides signed output only.");
    },

    async warm() {
      // The token function has its own 7.5-second upstream bound. Do not tie a
      // shared warmup request to a short-lived caller signal; the first chunk
      // may arrive while that token request is still completing.
      await getToken();
      return true;
    },

    async textToSign({ text } = {}) {
      const sentence = typeof text === "string" ? text.trim() : "";
      if (!sentence) throw new Error("Signa: enter text to sign.");
      if (sentence.length > cfg.maxTextChars) {
        throw new Error(`Signa: keep each request to ${cfg.maxTextChars} characters or fewer.`);
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

      try {
        let token = await waitForAbortable(getToken(false, controller.signal), controller.signal);
        try {
          return await requestVideo(sentence, token, controller.signal);
        } catch (error) {
          // Client tokens are short-lived. Refresh once if a segment arrives
          // after the cached token expires, then retry the same sentence.
          if (error?.status !== 401) throw error;
          cachedToken = "";
          tokenExpiresAt = 0;
          token = await waitForAbortable(getToken(true, controller.signal), controller.signal);
          return await requestVideo(sentence, token, controller.signal);
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          throw new Error("Signa rendering timed out. The transcript is preserved; try repeating the segment.");
        }
        throw error;
      } finally {
        clearTimeout(timer);
      }
    },

    async healthy() {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        const response = await fetch(`${baseUrl}/status`, {
          headers: { accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) return false;
        const status = await response.json();
        return Boolean(status?.configured);
      } catch {
        return false;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
