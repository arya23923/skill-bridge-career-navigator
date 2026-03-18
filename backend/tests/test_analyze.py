import pytest
import sys
import os
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app

client = TestClient(app)


# ── Happy Path ───────────────────────────────────────────────────────────────

def test_analyze_happy_path():
    """Valid PDF upload + role should return full analysis."""

    mock_resume_text = """
    John Doe | Backend Developer
    Skills: Python, FastAPI, PostgreSQL, Docker, Git, REST APIs, SQL
    
    Projects:
    - Built a REST API with JWT authentication and PostgreSQL database design
    - Deployed microservice using Docker and implemented CI/CD pipeline
    """

    with patch("routers.analyze.extract_text", new_callable=AsyncMock) as mock_parse, \
         patch("routers.analyze.extract_resume_data") as mock_extract, \
         patch("routers.analyze.generate_roadmap") as mock_roadmap:

        mock_parse.return_value = mock_resume_text
        mock_extract.return_value = (
            ["Python", "FastAPI", "PostgreSQL", "Docker", "Git", "REST APIs", "SQL"],
            ["Built a REST API with JWT authentication", "Deployed microservice using Docker"],
            False
        )
        mock_roadmap.return_value = (
            {
                "immediate": ["Learn Redis", "Build auth system"],
                "short_term": ["Deploy on AWS", "Learn Kubernetes"],
                "long_term": ["Master microservices", "Learn gRPC"],
                "suggested_projects": ["Build a REST API", "Create a CLI tool"],
            },
            False
        )

        pdf_content = b"%PDF-1.4 fake pdf content"
        response = client.post(
            "/api/analyze",
            data={"role": "Backend Developer"},
            files={"file": ("resume.pdf", io.BytesIO(pdf_content), "application/pdf")},
        )

    assert response.status_code == 200
    data = response.json()
    assert "profile_score" in data
    assert 0 <= data["profile_score"] <= 100
    assert "missing_skills" in data
    assert isinstance(data["missing_skills"], list)
    assert "roadmap" in data
    assert "immediate" in data["roadmap"]
    assert "suggested_projects" in data["roadmap"]
    assert "ai_used" in data


# ── Edge Cases ───────────────────────────────────────────────────────────────

def test_analyze_invalid_role():
    """Invalid role should return 400."""
    pdf_content = b"%PDF-1.4 fake"
    response = client.post(
        "/api/analyze",
        data={"role": "Astronaut"},
        files={"file": ("resume.pdf", io.BytesIO(pdf_content), "application/pdf")},
    )
    assert response.status_code == 400
    assert "Invalid role" in response.json()["detail"]


def test_analyze_unsupported_file_type():
    """Non-PDF/DOCX file should return 400."""
    response = client.post(
        "/api/analyze",
        data={"role": "Backend Developer"},
        files={"file": ("resume.txt", io.BytesIO(b"some text"), "text/plain")},
    )
    assert response.status_code == 400
    assert "PDF" in response.json()["detail"] or "DOCX" in response.json()["detail"]


def test_health_endpoint():
    """Health check should always return 200."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_certifications_valid_role():
    """Valid role should return list of certifications."""
    response = client.get("/api/certifications/Backend Developer")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "name" in data[0]
    assert "provider" in data[0]
    assert "url" in data[0]


def test_certifications_invalid_role():
    """Invalid role should return 404."""
    response = client.get("/api/certifications/Astronaut")
    assert response.status_code == 404