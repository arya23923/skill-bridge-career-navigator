import json
import os
from fastapi import APIRouter, HTTPException
from typing import List
from models import Certification

router = APIRouter()

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/certifications.json")


@router.get("/certifications/{role}", response_model=List[Certification])
def get_certifications(role: str):
    with open(DATA_PATH, "r") as f:
        data = json.load(f)

    if role not in data:
        raise HTTPException(status_code=404, detail=f"No certifications found for role: {role}")

    return data[role]