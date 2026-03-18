from pydantic import BaseModel
from typing import List, Optional


class Roadmap(BaseModel):
    immediate: List[str]
    short_term: List[str]
    long_term: List[str]
    suggested_projects: List[str]


class AnalysisResponse(BaseModel):
    profile_score: int
    skill_coverage: int
    project_relevance: int
    extracted_skills: List[str]
    extracted_projects: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    roadmap: Roadmap
    ai_used: bool


class Certification(BaseModel):
    name: str
    provider: str
    url: str
    level: str