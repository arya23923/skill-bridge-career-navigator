import type {
  AnalysisResult,
  HealthResponse,
  ProfileRequest,
  Role,
  SkillsData,
  Certification,
} from "../types";

const BASE = "/api";

// ── Low-level fetch wrapper ───────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      if (Array.isArray(err.detail)) {
        // FastAPI validation errors come as an array of objects
        message = err.detail
          .map((d: { msg?: string; message?: string }) => d.msg ?? d.message ?? JSON.stringify(d))
          .join(", ");
      } else if (typeof err.detail === "string") {
        message = err.detail;
      }
    } catch {
      // ignore JSON parse failures – fall back to status message above
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ── Typed API methods ─────────────────────────────────────────────────────────

export const api = {
  /** List all available target roles. */
  getRoles(): Promise<Role[]> {
    return request<Role[]>("/roles");
  },

  /** Categorised skills taxonomy (~80 skills across 6 categories). */
  getSkills(): Promise<SkillsData> {
    return request<SkillsData>("/skills");
  },

  /** All certifications (unfiltered). */
  getCertifications(): Promise<Certification[]> {
    return request<Certification[]>("/certifications");
  },

  /** Full profile gap analysis — runs Gemini then falls back to rule-based. */
  analyseProfile(payload: ProfileRequest): Promise<AnalysisResult> {
    return request<AnalysisResult>("/analyse", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Health check — tells you whether Gemini is live. */
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/health");
  },
};