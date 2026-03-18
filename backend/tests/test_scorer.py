import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.scorer import score_profile


# ── Happy Path ──────────────────────────────────────────────────────────────

def test_score_profile_backend_developer_happy_path():
    """A well-qualified backend dev should score above 30."""
    skills = ["Python", "REST APIs", "SQL", "Docker", "Git", "PostgreSQL", "FastAPI"]
    projects = ["Built a REST API with authentication and database design", "Deployed microservice with Docker"]

    result = score_profile("Backend Developer", skills, projects)

    assert 0 <= result["profile_score"] <= 100
    assert isinstance(result["matched_skills"], list)
    assert isinstance(result["missing_skills"], list)
    assert isinstance(result["strengths"], list)
    assert len(result["matched_skills"]) > 0
    assert result["skill_coverage"] > 0
    assert result["profile_score"] > 30


def test_score_profile_frontend_developer_happy_path():
    """A frontend dev with core skills should have low missing skills count."""
    skills = ["HTML", "CSS", "JavaScript", "React", "TypeScript"]
    projects = ["Built a portfolio site and e-commerce UI with component library"]

    result = score_profile("Frontend Developer", skills, projects)

    assert result["skill_coverage"] == 100  # all core skills matched
    assert len(result["missing_skills"]) == 0
    assert result["profile_score"] > 40


# ── Edge Cases ───────────────────────────────────────────────────────────────

def test_score_profile_empty_skills():
    """Empty skills list should return zero coverage without crashing."""
    result = score_profile("Backend Developer", [], [])

    assert result["profile_score"] == 0
    assert result["skill_coverage"] == 0
    assert result["matched_skills"] == []
    assert isinstance(result["missing_skills"], list)
    assert len(result["missing_skills"]) > 0  # should list all missing


def test_score_profile_invalid_role():
    """Unknown role should return empty result without raising exception."""
    result = score_profile("Astronaut", ["Python"], ["Built a rocket"])

    assert result["profile_score"] == 0
    assert result["matched_skills"] == []
    assert result["missing_skills"] == []


def test_score_profile_case_insensitive_skills():
    """Skill matching should be case-insensitive."""
    skills_lower = ["python", "sql", "docker"]
    skills_upper = ["Python", "SQL", "Docker"]

    result_lower = score_profile("Backend Developer", skills_lower, [])
    result_upper = score_profile("Backend Developer", skills_upper, [])

    assert result_lower["skill_coverage"] == result_upper["skill_coverage"]
    assert len(result_lower["matched_skills"]) == len(result_upper["matched_skills"])


def test_score_never_exceeds_100():
    """Score should never exceed 100 even with all skills."""
    all_skills = [
        "Python", "REST APIs", "SQL", "Docker", "Git", "FastAPI", "PostgreSQL",
        "Kubernetes", "Redis", "Message Queues", "gRPC", "Microservices", "AWS", "Linux"
    ]
    projects = ["REST API auth system database design microservice deployment pipeline"]

    result = score_profile("Backend Developer", all_skills, projects)

    assert result["profile_score"] <= 100
    assert result["skill_coverage"] <= 100