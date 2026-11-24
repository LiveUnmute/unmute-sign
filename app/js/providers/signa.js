// Signa AI — English text to an ASL avatar video.
//
// The API key stays in the Netlify Function. This browser provider only calls
// our same-origin /api/signa/video route, which signs English (en) as ASL (ase)
// and returns the resulting MP4. Signa's published API does not recognise
// patient signing; that direction is supplied by a separate provider.

const DEFAULTS = {
  baseUrl: "/api/signa",
  timeoutMs: 15_000,
};

export function createSignaProvider(config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  const baseUrl = String(cfg.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "");

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

    async textToSign({ text } = {}) {
      const sentence = typeof text === "string" ? text.trim() : "";
      if (!sentence) throw new Error("Signa: enter text to sign.");
      if (sentence.length > 300) throw new Error("Signa: keep each request to 300 characters or fewer.");

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

      try {
        const response = await fetch(`${baseUrl}/video`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "video/mp4, application/json",
          },
          body: JSON.stringify({ text: sentence }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const raw = await response.text().catch(() => "");
          let detail = raw;
          try {
            const json = raw ? JSON.parse(raw) : null;
            detail = json?.message || json?.error || raw;
          } catch {
            // Keep the short text response below.
          }
          throw new Error(`Signa ${response.status}: ${String(detail || "request failed").slice(0, 220)}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("video/mp4")) {
          throw new Error("Signa: the proxy did not return an MP4 video.");
        }

        const blob = await response.blob();
        if (!blob.size) throw new Error("Signa: the proxy returned an empty video.");

        return {
          videoUrl: URL.createObjectURL(new Blob([blob], { type: "video/mp4" })),
          durationMs: 0,
          source: "signa",
        };
      } catch (error) {
        if (error?.name === "AbortError") {
          throw new Error("Signa: rendering timed out. Try a shorter sentence.");
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
