import json
import os
import re
from typing import List, Dict

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/skills_db.json")

# Common tech keywords for rule-based extraction
KNOWN_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php",
    "react", "angular", "vue", "next.js", "nuxt", "svelte", "html", "css", "tailwind",
    "node.js", "express", "fastapi", "django", "flask", "spring", "rails",
    "sql", "postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle",
    "docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions",
    "aws", "gcp", "azure", "linux", "bash", "git",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "keras", "mlflow",
    "graphql", "rest", "grpc", "websocket", "kafka", "rabbitmq",
    "jest", "pytest", "cypress", "selenium", "junit",
    "ci/cd", "devops", "agile", "scrum"
]

PROJECT_KEYWORDS = [
    "built", "developed", "created", "implemented", "designed", "deployed",
    "project", "application", "app", "system", "platform", "api", "website",
    "service", "tool", "library", "framework", "pipeline"
]


def extract_skills_fallback(text: str) -> List[str]:
    """Rule-based skill extraction using keyword matching."""
    text_lower = text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Return properly capitalized version
            found.append(_capitalize_skill(skill))
    return list(dict.fromkeys(found))  # deduplicate preserving order


def extract_projects_fallback(text: str) -> List[str]:
    """Rule-based project extraction — finds sentences with project indicators."""
    sentences = re.split(r'[.\n]', text)
    projects = []
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 15:
            continue
        lower = sentence.lower()
        if any(kw in lower for kw in PROJECT_KEYWORDS):
            projects.append(sentence[:200])
            if len(projects) >= 5:
                break
    return projects


def generate_roadmap_fallback(role: str, missing_skills: List[str]) -> Dict:
    """Rule-based roadmap from skills_db templates."""
    with open(DATA_PATH, "r") as f:
        db = json.load(f)

    if role not in db:
        return _default_roadmap()

    templates = db[role].get("roadmap_templates", {})
    project_signals = db[role].get("project_signals", [])

    suggested_projects = [
        f"Build a {sig} to demonstrate {role} skills" for sig in project_signals[:3]
    ]

    if missing_skills:
        immediate_extra = [f"Learn {skill}" for skill in missing_skills[:2]]
        immediate = immediate_extra + templates.get("immediate", [])
    else:
        immediate = templates.get("immediate", [])

    return {
        "immediate": immediate[:4],
        "short_term": templates.get("short_term", [])[:4],
        "long_term": templates.get("long_term", [])[:4],
        "suggested_projects": suggested_projects,
    }


def _default_roadmap() -> Dict:
    return {
        "immediate": ["Identify core skills for your target role", "Start with foundational projects"],
        "short_term": ["Build 2-3 portfolio projects", "Get relevant certifications"],
        "long_term": ["Contribute to open source", "Apply for roles with strong portfolio"],
        "suggested_projects": ["Build a portfolio project showcasing your skills"],
    }


def _capitalize_skill(skill: str) -> str:
    special = {
        "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript",
        "java": "Java", "c++": "C++", "c#": "C#", "go": "Go", "rust": "Rust",
        "react": "React", "angular": "Angular", "vue": "Vue", "next.js": "Next.js",
        "node.js": "Node.js", "fastapi": "FastAPI", "django": "Django",
        "flask": "Flask", "spring": "Spring", "postgresql": "PostgreSQL",
        "mongodb": "MongoDB", "redis": "Redis", "sqlite": "SQLite",
        "docker": "Docker", "kubernetes": "Kubernetes", "terraform": "Terraform",
        "aws": "AWS", "gcp": "GCP", "azure": "Azure", "linux": "Linux",
        "tensorflow": "TensorFlow", "pytorch": "PyTorch", "graphql": "GraphQL",
        "github actions": "GitHub Actions", "ci/cd": "CI/CD",
        "rest": "REST", "grpc": "gRPC", "kafka": "Kafka",
        "pytest": "pytest", "jest": "Jest", "html": "HTML", "css": "CSS",
        "sql": "SQL", "bash": "Bash", "git": "Git",
        "scikit-learn": "Scikit-learn", "pandas": "Pandas", "numpy": "NumPy",
    }
    return special.get(skill.lower(), skill.title())