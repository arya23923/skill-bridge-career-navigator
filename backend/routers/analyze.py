import json
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from models import AnalysisResponse, Roadmap
from services.resume_parser import extract_text
from services.ai_service import extract_resume_data, generate_roadmap
from services.scorer import score_profile

router = APIRouter()

VALID_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "ML Engineer",
    "DevOps Engineer",
]


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    role: str = Form(...),
):
    # Validate role
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"
        )

    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx")):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    # Step 1: Parse resume
    resume_text = await extract_text(file)

    # Step 2: Extract skills + projects (AI or fallback)
    extracted_skills, extracted_projects, extraction_ai_used = extract_resume_data(resume_text, role)

    if not extracted_skills:
        raise HTTPException(
            status_code=422,
            detail="Could not extract any skills from the resume. Please ensure your resume contains technical skills."
        )

    # Step 3: Score profile (deterministic)
    scores = score_profile(role, extracted_skills, extracted_projects)

    # Step 4: Generate roadmap (AI or fallback)
    roadmap_dict, roadmap_ai_used = generate_roadmap(
        role=role,
        extracted_skills=extracted_skills,
        missing_skills=scores["missing_skills"],
        extracted_projects=extracted_projects,
        strengths=scores["strengths"],
    )

    ai_used = extraction_ai_used or roadmap_ai_used

    return AnalysisResponse(
        profile_score=scores["profile_score"],
        skill_coverage=scores["skill_coverage"],
        project_relevance=scores["project_relevance"],
        extracted_skills=extracted_skills,
        extracted_projects=extracted_projects,
        matched_skills=scores["matched_skills"],
        missing_skills=scores["missing_skills"],
        strengths=scores["strengths"],
        roadmap=Roadmap(**roadmap_dict),
        ai_used=ai_used,
    )