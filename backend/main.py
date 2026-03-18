from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import analyze, certifications

app = FastAPI(
    title="Career Navigator API",
    description="Analyzes resumes and provides personalized learning roadmaps",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(certifications.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}