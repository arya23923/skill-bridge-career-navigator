export interface Roadmap {
  immediate: string[]
  short_term: string[]
  long_term: string[]
  suggested_projects: string[]
}

export interface AnalysisResponse {
  profile_score: number
  skill_coverage: number
  project_relevance: number
  extracted_skills: string[]
  extracted_projects: string[]
  matched_skills: string[]
  missing_skills: string[]
  strengths: string[]
  roadmap: Roadmap
  ai_used: boolean
}

export interface Certification {
  name: string
  provider: string
  url: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export type AppState = 'upload' | 'loading' | 'result'