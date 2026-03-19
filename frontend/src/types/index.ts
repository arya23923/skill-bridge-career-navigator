// ─────────────────────────────────────────────────────────────────────────────
// Domain models
// ─────────────────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  title: string;
  description: string;
  avg_salary: string;
  demand: string;
  open_roles: number;
}

export interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  role?: string;
  github_url?: string;
}

export interface ProfileRequest {
  name: string;
  target_role_id: string;
  skills: string[];
  projects: Project[];
  experience_years: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API response shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillsData {
  categories: Record<string, string[]>;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  focus: string;
  actions: string[];
}

export interface RecommendedProject {
  title: string;
  description: string;
  tech_stack: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  impact: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  relevant_roles: string[];
  relevant_skills: string[];
  level: "Foundational" | "Associate" | "Professional";
  cost: string;
  study_weeks: number;
  url: string;
  why_get_it: string;
  priority: number;
  addresses_gaps: string[];
}

export interface AnalysisResult {
  // Core stats
  match_pct: number;
  rating: "Strong" | "Moderate" | "Developing";
  rating_color: "green" | "amber" | "red";

  // Skill breakdown
  matched_skills: string[];
  missing_skills: string[];
  priority_missing: string[];
  skills_from_projects: string[];

  // AI or rule-based narrative
  summary: string;
  strengths?: string[];
  quick_wins?: string[];
  interview_tip?: string;
  ai_powered: boolean;
  ai_error?: string;

  // Structured roadmap
  roadmap_phases: RoadmapPhase[];

  // Static data attached by backend
  recommended_projects: RecommendedProject[];
  certifications: Certification[];

  // Role meta
  role: {
    title: string;
    avg_salary: string;
    demand: string;
    open_roles: number;
  };
}

export interface HealthResponse {
  status: string;
  gemini_available: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI helper types
// ─────────────────────────────────────────────────────────────────────────────

export type DashboardTab = "gap" | "roadmap" | "projects" | "certs";

export type ValidationErrors = Partial<Record<string, string>>;

export interface ProjectErrors {
  title?: string;
  tech_stack?: string;
}