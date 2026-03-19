export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
}

export interface CareerPath {
  title: string;
  company?: string;
  matchScore: number;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skillGaps: SkillGap[];
  timeToReady: string;
  description: string;
  requiredSkills: string[];
  growthPotential: "high" | "medium" | "low";
}

export interface UserProfile {
  name: string;
  currentRole: string;
  experience: number;
  skills: string[];
  education: string;
  resumeText?: string;
}

export interface AnalysisResult {
  userProfile: UserProfile;
  recommendedPaths: CareerPath[];
  topSkillsToLearn: string[];
  overallReadinessScore: number;
  summary: string;
}

export interface UploadState {
  status: "idle" | "uploading" | "analyzing" | "complete" | "error";
  progress: number;
  error?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}