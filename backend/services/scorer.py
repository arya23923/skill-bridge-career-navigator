import json
import os
from typing import List, Dict, Tuple

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/skills_db.json")


def load_skills_db() -> Dict:
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def normalize(skill: str) -> str:
    return skill.strip().lower()


def score_profile(
    role: str,
    extracted_skills: List[str],
    extracted_projects: List[str]
) -> Dict:
    """
    Deterministic scoring — no AI involved.
    Returns score breakdown, matched/missing skills, strengths.
    """
    db = load_skills_db()

    if role not in db:
        return _empty_score(role)

    role_data = db[role]
    core_skills = role_data["core_skills"]
    advanced_skills = role_data["advanced_skills"]
    project_signals = role_data["project_signals"]

    normalized_extracted = [normalize(s) for s in extracted_skills]
    normalized_core = [normalize(s) for s in core_skills]
    normalized_advanced = [normalize(s) for s in advanced_skills]
    normalized_signals = [normalize(s) for s in project_signals]

    # Skill coverage — matched core skills
    matched_core = [
        s for s in core_skills
        if normalize(s) in normalized_extracted
    ]
    matched_advanced = [
        s for s in advanced_skills
        if normalize(s) in normalized_extracted
    ]
    matched_skills = matched_core + matched_advanced

    missing_skills = [
        s for s in core_skills
        if normalize(s) not in normalized_extracted
    ]

    skill_coverage = int(len(matched_core) / len(core_skills) * 100) if core_skills else 0

    # Project relevance — how many project signals appear in project descriptions
    project_text = " ".join(extracted_projects).lower()
    matched_signals = [sig for sig in normalized_signals if sig in project_text]
    project_relevance = int(len(matched_signals) / len(normalized_signals) * 100) if normalized_signals else 0

    # Advanced skill bonus
    advanced_bonus = int(len(matched_advanced) / len(advanced_skills) * 20) if advanced_skills else 0

    # Final score: 40% skill coverage + 40% project relevance + 20% advanced
    profile_score = int(skill_coverage * 0.4 + project_relevance * 0.4 + advanced_bonus)
    profile_score = max(0, min(100, profile_score))

    # Strengths
    strengths = []
    if len(matched_core) >= len(core_skills) * 0.7:
        strengths.append(f"Strong core {role} skill set")
    if matched_advanced:
        strengths.append(f"Advanced knowledge in: {', '.join(matched_advanced[:3])}")
    if matched_signals:
        strengths.append(f"Relevant project experience in: {', '.join(matched_signals[:2])}")
    if not strengths:
        strengths.append("Foundational skills identified — great starting point")

    return {
        "profile_score": profile_score,
        "skill_coverage": skill_coverage,
        "project_relevance": project_relevance,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "strengths": strengths,
    }


def _empty_score(role: str) -> Dict:
    return {
        "profile_score": 0,
        "skill_coverage": 0,
        "project_relevance": 0,
        "matched_skills": [],
        "missing_skills": [],
        "strengths": [],
    }