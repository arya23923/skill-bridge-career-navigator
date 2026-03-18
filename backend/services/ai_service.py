import os
import json
import re
from typing import Dict, List, Tuple

from services.fallback_service import (
    extract_skills_fallback,
    extract_projects_fallback,
    generate_roadmap_fallback,
)


def _get_gemini_model():
    """Initialize Gemini model — returns None if unavailable."""
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-1.5-flash")
    except ImportError:
        return None


def extract_resume_data(resume_text: str, role: str) -> Tuple[List[str], List[str], bool]:
    """
    Extract skills and projects from resume text.
    Returns (skills, projects, ai_used).
    """
    model = _get_gemini_model()

    if model:
        try:
            return _extract_with_gemini(model, resume_text, role)
        except Exception as e:
            print(f"[AI] Gemini extraction failed: {e}. Using fallback.")

    # Fallback
    skills = extract_skills_fallback(resume_text)
    projects = extract_projects_fallback(resume_text)
    return skills, projects, False


def generate_roadmap(
    role: str,
    extracted_skills: List[str],
    missing_skills: List[str],
    extracted_projects: List[str],
    strengths: List[str],
) -> Tuple[Dict, bool]:
    """
    Generate a personalized roadmap.
    Returns (roadmap_dict, ai_used).
    """
    model = _get_gemini_model()

    if model:
        try:
            return _roadmap_with_gemini(model, role, extracted_skills, missing_skills, extracted_projects, strengths)
        except Exception as e:
            print(f"[AI] Gemini roadmap failed: {e}. Using fallback.")

    roadmap = generate_roadmap_fallback(role, missing_skills)
    return roadmap, False


def _extract_with_gemini(model, resume_text: str, role: str) -> Tuple[List[str], List[str], bool]:
    prompt = f"""You are a resume parser. Extract information from this resume for someone targeting a {role} role.

Resume text:
{resume_text[:4000]}

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{{
  "skills": ["skill1", "skill2", "skill3"],
  "projects": ["brief project description 1", "brief project description 2"]
}}

Rules:
- skills: list all technical skills, tools, languages, frameworks mentioned
- projects: list up to 5 projects as brief one-line descriptions
- Return only JSON, nothing else"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    # Strip markdown code fences if present
    text = re.sub(r'^```json\s*', '', text)
    text = re.sub(r'^```\s*', '', text)
    text = re.sub(r'\s*```$', '', text)

    data = json.loads(text)
    skills = data.get("skills", [])
    projects = data.get("projects", [])
    return skills, projects, True


def _roadmap_with_gemini(
    model,
    role: str,
    extracted_skills: List[str],
    missing_skills: List[str],
    extracted_projects: List[str],
    strengths: List[str],
) -> Tuple[Dict, bool]:
    prompt = f"""You are a senior tech career advisor. Create a personalized learning roadmap.

Target Role: {role}
Current Skills: {', '.join(extracted_skills[:20]) if extracted_skills else 'None identified'}
Missing Core Skills: {', '.join(missing_skills[:10]) if missing_skills else 'None'}
Project Experience: {'; '.join(extracted_projects[:3]) if extracted_projects else 'None identified'}
Strengths: {', '.join(strengths) if strengths else 'Building foundations'}

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{{
  "immediate": ["action1", "action2", "action3"],
  "short_term": ["action1", "action2", "action3"],
  "long_term": ["action1", "action2", "action3"],
  "suggested_projects": ["project1", "project2", "project3"]
}}

Rules:
- immediate: 3-4 actions to do RIGHT NOW (this week/month)
- short_term: 3-4 actions for next 3 months
- long_term: 3-4 actions for 6+ months
- suggested_projects: 3 specific projects to build that will impress hiring managers for {role}
- Be specific, actionable, and tailored to the missing skills
- Return only JSON, nothing else"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    text = re.sub(r'^```json\s*', '', text)
    text = re.sub(r'^```\s*', '', text)
    text = re.sub(r'\s*```$', '', text)

    roadmap = json.loads(text)
    return roadmap, True