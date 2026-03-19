import type { AnalysisResponse, Certification } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeResume(
  file: File,
  role: string
): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("role", role);

  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function getCertifications(
  role: string
): Promise<Certification[]> {
  const encoded = encodeURIComponent(role);
  const res = await fetch(`${BASE_URL}/certifications/${encoded}`);
  if (!res.ok) return [];
  return res.json();
}