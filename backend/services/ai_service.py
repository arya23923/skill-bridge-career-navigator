import os
import json
import re
from typing import Dict, List, Tuple, Optional

from services.fallback_service import (
    extract_skills_fallback,
    extract_projects_fallback,
    generate_roadmap_fallback,
)

GROQ_MODEL = "llama-3.3-70b-versatile"


def _get_groq_client():
    """Returns Groq client or None if unavailable."""
    try:
        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            print("[AI] No GROQ_API_KEY found in .env")
            return None
        return Groq(api_key=api_key)
    except ImportError:
        print("[AI] groq not installed — run: pip install groq")
        return None


def _call_groq(prompt: str) -> Optional[str]:
    """Call Groq API. Returns text response or None on failure."""
    client = _get_groq_client()
    if not client:
        return None

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert AI assistant. Always respond with valid JSON only — no markdown, no backticks, no explanation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[AI] Groq error: {e}")
        return None


def extract_resume_data(resume_text: str, role: str) -> Tuple[List[str], List[str], bool]:
    """Extract skills and projects from resume. Returns (skills, projects, ai_used)."""

    prompt = f"""You are an expert resume parser. Thoroughly analyze every section of this resume.

Target Role: {role}

Resume text:
{resume_text[:6000]}

Extract ALL information from EVERY section — Work Experience, Projects, Skills,
Achievements, Open Source Contributions, Certifications, Education, Volunteer Work,
Publications, Awards, Hackathons, Research, or any other section present.

Return ONLY valid JSON in this exact format:
{{
  "skills": ["skill1", "skill2", ...],
  "projects": ["description1", "description2", ...]
}}

Rules for skills:
- Extract ALL technical skills: languages, frameworks, libraries, tools, platforms,
  databases, cloud services, methodologies, protocols
- Include skills mentioned in experience bullets even if not in a dedicated skills section
- Include skills implied by tools used (e.g. Kubernetes implies Docker)
- Do NOT include generic words like "communication", "teamwork"
- Aim for 15-40 skills if they exist in the resume

Rules for projects:
- Extract from: Projects section, Work Experience, Open Source, Side Projects,
  Hackathons, Research, Academic Projects, Freelance Work
- For each write ONE sentence: what it does + tech stack used + any metrics or achievements
- Include up to 10 projects
- Work experience bullets that describe building something count as projects

Return only JSON, nothing else."""

    text = _call_groq(prompt)

    if text:
        try:
            text = _clean_json(text)
            data = json.loads(text)
            skills = data.get("skills", [])
            projects = data.get("projects", [])
            if skills:
                print(f"[AI] Extracted {len(skills)} skills and {len(projects)} projects")
                return skills, projects, True
        except Exception as e:
            print(f"[AI] JSON parse error: {e} — using fallback")

    print("[AI] Using rule-based fallback for extraction")
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
    """Generate personalized roadmap. Returns (roadmap_dict, ai_used)."""

    # Assess experience level from what was extracted
    skill_count = len(extracted_skills)
    project_count = len(extracted_projects)

    if skill_count >= 15 and project_count >= 4:
        experience_level = "experienced professional"
        level_context = "They are NOT a beginner. Do not suggest learning fundamentals they clearly already know."
    elif skill_count >= 8 and project_count >= 2:
        experience_level = "mid-level developer"
        level_context = "They have solid foundations. Focus on bridging specific gaps and leveling up, not basics."
    elif skill_count >= 4:
        experience_level = "junior developer with some experience"
        level_context = "They have some experience. Build on what they know — do not start from scratch."
    else:
        experience_level = "early-career developer"
        level_context = "They are building their foundation. Guide them practically step by step."

    projects_formatted = chr(10).join(
        f"- {p}" for p in extracted_projects[:5]
    ) if extracted_projects else "- No projects identified"

    prompt = f"""You are a senior tech career advisor giving a personalized roadmap to a real person.

TARGET ROLE: {role}
CANDIDATE LEVEL: {experience_level}
IMPORTANT CONTEXT: {level_context}

WHAT THEY ALREADY KNOW ({skill_count} skills identified):
{", ".join(extracted_skills[:30]) if extracted_skills else "None identified"}

THEIR EXISTING PROJECTS AND EXPERIENCE:
{projects_formatted}

WHAT THEY ARE MISSING for {role}:
{", ".join(missing_skills) if missing_skills else "No critical gaps — strong profile for this role"}

THEIR STRENGTHS:
{", ".join(strengths) if strengths else "Building foundations"}

Based on their CURRENT SITUATION, generate a realistic roadmap that picks up exactly where they are.
DO NOT suggest things they already know. DO NOT treat them as a beginner if they are not.
Reference their existing skills when suggesting next steps (e.g. "Since you know Docker, now add Kubernetes").
Make suggested projects build on their existing project experience and tech stack.

Return ONLY valid JSON in this exact format:
{{
  "immediate": ["action1", "action2", "action3", "action4"],
  "short_term": ["action1", "action2", "action3", "action4"],
  "long_term": ["action1", "action2", "action3", "action4"],
  "suggested_projects": ["project1", "project2", "project3"]
}}

Rules:
- immediate: 3-4 actions for RIGHT NOW — the most impactful gaps to close first given their current level
- short_term: 3-4 actions for next 3 months — deepen expertise and build targeted portfolio pieces
- long_term: 3-4 actions for 6+ months — senior-level positioning, advanced topics, career moves
- suggested_projects: 3 specific projects that directly showcase {role} skills to hiring managers.
  These must BUILD ON their existing experience and tech stack, not start from zero.
  Be concrete — name the project type, the tech to use, and what problem it solves.
- Every single action must be tailored to THIS person's current situation
- Return only JSON, nothing else"""

    text = _call_groq(prompt)

    if text:
        try:
            text = _clean_json(text)
            roadmap = json.loads(text)
            if roadmap.get("immediate"):
                print("[AI] Roadmap generated successfully")
                return roadmap, True
        except Exception as e:
            print(f"[AI] Roadmap JSON parse error: {e} — using fallback")

    print("[AI] Using rule-based fallback for roadmap")
    roadmap = generate_roadmap_fallback(role, missing_skills)
    return roadmap, False


def _clean_json(text: str) -> str:
    """Strip markdown fences from response."""
    text = text.strip()
    text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^```\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    return text.strip()