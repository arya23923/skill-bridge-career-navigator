import json
import os
import re
from typing import List, Dict

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/skills_db.json")


def load_skills_db() -> Dict:
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def normalize(skill: str) -> str:
    """Normalize skill name for comparison."""
    return skill.strip().lower().replace(".", "").replace("-", "").replace(" ", "").replace("/", "")


# Common aliases — maps variations to canonical normalized form
ALIASES = {
    "nodejs": "nodejs",
    "node":   "nodejs",
    "reactjs": "react",
    "react":   "react",
    "vuejs":   "vue",
    "angularjs": "angular",
    "nextjs":  "nextjs",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "mongo":   "mongodb",
    "mongodb": "mongodb",
    "k8s":     "kubernetes",
    "kube":    "kubernetes",
    "kubernetes": "kubernetes",
    "tf":      "terraform",
    "terraform": "terraform",
    "gcp":     "gcp",
    "googlecloud": "gcp",
    "aws":     "aws",
    "amazon":  "aws",
    "azure":   "azure",
    "microsoftazure": "azure",
    "js":      "javascript",
    "javascript": "javascript",
    "ts":      "typescript",
    "typescript": "typescript",
    "py":      "python",
    "python":  "python",
    "ml":      "machinelearning",
    "machinelearning": "machinelearning",
    "ai":      "artificialintelligence",
    "dl":      "deeplearning",
    "deeplearning": "deeplearning",
    "cv":      "computervision",
    "nlp":     "nlp",
    "sklearn": "scikitlearn",
    "scikitlearn": "scikitlearn",
    "scikit":  "scikitlearn",
    "tf2":     "tensorflow",
    "tensorflow": "tensorflow",
    "torch":   "pytorch",
    "pytorch": "pytorch",
    "restapi": "restapis",
    "rest":    "restapis",
    "restapis": "restapis",
    "api":     "restapis",
    "cicd":    "cicd",
    "ci/cd":   "cicd",
    "github":  "git",
    "gitlab":  "git",
    "git":     "git",
    "docker":  "docker",
    "linux":   "linux",
    "ubuntu":  "linux",
    "bash":    "bash",
    "shell":   "bash",
    "sql":     "sql",
    "mysql":   "sql",
    "sqlite":  "sql",
    "redis":   "redis",
    "fastapi": "fastapi",
    "django":  "django",
    "flask":   "flask",
    "spring":  "spring",
    "springboot": "spring",
    "kotlin":  "kotlin",
    "swift":   "swift",
    "solidity": "solidity",
    "java":    "java",
    "golang":  "go",
    "go":      "go",
    "rust":    "rust",
    "cpp":     "c++",
    "c++":     "c++",
    "csharp":  "c#",
    "c#":      "c#",
    "dotnet":  "c#",
    "html":    "html",
    "css":     "css",
    "tailwind": "tailwindcss",
    "tailwindcss": "tailwindcss",
    "graphql": "graphql",
    "grpc":    "grpc",
    "kafka":   "kafka",
    "spark":   "spark",
    "pandas":  "pandas",
    "numpy":   "numpy",
    "jupyter": "jupyter",
    "tableau": "tableau",
    "powerbi": "powerbi",
    "dbt":     "dbt",
    "airflow": "airflow",
    "mlflow":  "mlflow",
    "prometheus": "prometheus",
    "grafana": "grafana",
    "ansible": "ansible",
    "helm":    "helm",
    "istio":   "istio",
    "selenium": "selenium",
    "cypress": "cypress",
    "jest":    "jest",
    "pytest":  "pytest",
    "junit":   "junit",
    "jira":    "jira",
    "agile":   "agile",
    "scrum":   "agile",
    "unity":   "unity",
    "unreal":  "unrealengine",
    "opengl":  "opengl",
    "vulkan":  "vulkan",
    "llvm":    "llvm",
}


def to_alias(skill: str) -> str:
    """Convert a skill to its canonical alias."""
    n = normalize(skill)
    return ALIASES.get(n, n)


def skills_match(skill_a: str, skill_b: str) -> bool:
    """
    Check if two skills match using:
    1. Exact normalized match
    2. Alias match
    3. Substring match (one contains the other)
    """
    a = normalize(skill_a)
    b = normalize(skill_b)

    # Exact match
    if a == b:
        return True

    # Alias match
    if ALIASES.get(a, a) == ALIASES.get(b, b):
        return True

    # Substring match — e.g. "restapis" matches "rest"
    if len(a) >= 3 and len(b) >= 3:
        if a in b or b in a:
            return True

    return False


def score_profile(
    role: str,
    extracted_skills: List[str],
    extracted_projects: List[str]
) -> Dict:
    """
    Deterministic scoring with fuzzy skill matching.
    """
    db = load_skills_db()

    if role not in db:
        return _empty_score()

    role_data = db[role]
    core_skills = role_data["core_skills"]
    advanced_skills = role_data["advanced_skills"]
    project_signals = role_data["project_signals"]

    # Match core skills
    matched_core = [
        s for s in core_skills
        if any(skills_match(s, e) for e in extracted_skills)
    ]

    # Match advanced skills
    matched_advanced = [
        s for s in advanced_skills
        if any(skills_match(s, e) for e in extracted_skills)
    ]

    matched_skills = matched_core + matched_advanced

    missing_skills = [
        s for s in core_skills
        if not any(skills_match(s, e) for e in extracted_skills)
    ]

    skill_coverage = int(len(matched_core) / len(core_skills) * 100) if core_skills else 0

    # Project relevance — check signals against full project text
    # Also check against extracted skills for signal keywords
    project_text = " ".join(extracted_projects + extracted_skills).lower()
    project_text = re.sub(r'[^a-z0-9 ]', ' ', project_text)

    matched_signals = []
    for sig in project_signals:
        sig_words = sig.lower().split()
        # Signal matches if ALL its words appear somewhere in project text
        if all(word in project_text for word in sig_words):
            matched_signals.append(sig)

    project_relevance = int(len(matched_signals) / len(project_signals) * 100) if project_signals else 0

    # Advanced skill bonus (up to 20 points)
    advanced_bonus = int(len(matched_advanced) / len(advanced_skills) * 20) if advanced_skills else 0

    # Final score
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


def _empty_score() -> Dict:
    return {
        "profile_score": 0,
        "skill_coverage": 0,
        "project_relevance": 0,
        "matched_skills": [],
        "missing_skills": [],
        "strengths": [],
    }