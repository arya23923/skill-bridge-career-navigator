# skill-bridge-career-navigator

**Candidate Name:** Arya Gupta  
**Scenario Chosen:** Career Navigation Platform — Resume analysis with personalized learning roadmap  
**Estimated Time Spent:** 5 hours

---

## Quick Start

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Groq API key 

### Demo video

### Run Commands
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
uvicorn main:app --reload
```
```bash
# Frontend (open a new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at **http://localhost:5173** — backend at **http://localhost:8000/**

### Test Commands
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

Expected: **12 passed**

---

## AI Disclosure

**Did you use an AI assistant (Copilot, ChatGPT, etc.)?** Yes — Claude (Anthropic)

**How did you verify the suggestions?**
- Ran all 12 tests after every major change to confirm nothing broke
- Manually tested resume uploads with real PDF files to verify parsing and scoring worked end to end
- Checked the live API at `http://localhost:8000/docs` — FastAPI auto-generates interactive docs
- Reviewed every prompt sent to Groq to ensure the model received the correct context
- Verified the fallback service activated correctly by temporarily removing the API key
- Cross-checked `skills_db.json` and `certifications.json` manually for accuracy across roles

**Give one example of a suggestion you rejected or changed:**  
The initial roadmap prompt treated every user as a beginner regardless of their actual experience — it would suggest "learn Python basics" to someone with 20 Python projects. I rejected this and redesigned the prompt to first classify the candidate's experience level (experienced professional / mid-level / junior / early-career) based on extracted skill count and project count, then explicitly instruct the model to reference their existing skills when suggesting next steps rather than starting from scratch.

---

## Tradeoffs & Prioritization

**What did you cut to stay within the 4–6 hour limit?**
- No user authentication or session persistence — every analysis is stateless
- No database — `skills_db.json` and `certifications.json` are flat files, not a proper DB
- No resume preview on the frontend — file is sent directly to backend without rendering
- No salary data or job market information in the roadmap output

**What would you build next if you had more time?**
- GitHub profile integration — parse repositories to extract real project tech stacks automatically
- User accounts — save and track roadmap progress over time
- Job listing integration — match the profile against real open roles from a jobs API
- Rate resume according to the ats score to present better suggestions.

**Known Limitations**
- Scanned PDF resumes (image-based) cannot be parsed — only text-based PDFs are supported
- Groq free tier has a daily limit of 14,400 requests — the rule-based fallback activates when exhausted, producing less personalised results
- Skill matching relies on a manually curated alias dictionary — uncommon or very new tools may not be recognised
- Scoring is relative to the `skills_db.json` snapshot — roles and required skills evolve faster than a static file
- Project relevance scoring checks for keyword signals in descriptions — it does not assess the depth or quality of the work
- The experience level classifier is heuristic-based on skill and project count, not a true seniority assessment