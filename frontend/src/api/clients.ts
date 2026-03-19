import type { AnalysisResponse, Certification } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const analyzeResume = async (
  file: File,
  role: string
): Promise<AnalysisResponse> => {
  const form = new FormData()
  form.append('file', file)
  form.append('role', role)

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error occurred' }))
    throw new Error(err.detail || 'Analysis failed')
  }

  return res.json()
}

export const fetchCertifications = async (role: string): Promise<Certification[]> => {
  const res = await fetch(`${BASE_URL}/api/certifications/${encodeURIComponent(role)}`)
  if (!res.ok) return []
  return res.json()
}