import type { AnalysisResult } from "../types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API request failed");
  }

  const data = await response.json();
  const textBlock = data.content.find((b: { type: string }) => b.type === "text");
  return textBlock?.text || "";
}

export async function analyzeResume(
  resumeText: string
): Promise<AnalysisResult> {
  const systemPrompt = `You are SkillBridge, an expert career navigator AI. Analyze the provided resume and generate career path recommendations.

You MUST respond with ONLY valid JSON (no markdown, no backticks, no preamble) matching this exact structure:
{
  "userProfile": {
    "name": "string",
    "currentRole": "string",
    "experience": number,
    "skills": ["string"],
    "education": "string"
  },
  "recommendedPaths": [
    {
      "title": "string",
      "company": "string (optional)",
      "matchScore": number (0-100),
      "salary": { "min": number, "max": number, "currency": "USD" },
      "skillGaps": [
        {
          "skill": "string",
          "currentLevel": number (0-5),
          "requiredLevel": number (0-5),
          "priority": "critical|high|medium|low",
          "category": "string"
        }
      ],
      "timeToReady": "string",
      "description": "string",
      "requiredSkills": ["string"],
      "growthPotential": "high|medium|low"
    }
  ],
  "topSkillsToLearn": ["string"],
  "overallReadinessScore": number (0-100),
  "summary": "string"
}

Provide 3 career path recommendations. Be specific with skill gaps and salary ranges based on current market data.`;

  const raw = await callClaude(systemPrompt, `Analyze this resume:\n\n${resumeText}`);
  
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}

export async function chatWithAdvisor(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  analysisContext: AnalysisResult | null
): Promise<string> {
  const systemPrompt = `You are SkillBridge, a friendly and insightful career advisor AI. 
${analysisContext ? `You have analyzed the user's resume. Here's their profile context: ${JSON.stringify(analysisContext.userProfile)}. Their recommended paths include: ${analysisContext.recommendedPaths.map(p => p.title).join(", ")}.` : ""}
Help the user navigate their career transition with specific, actionable advice. Be encouraging but realistic. Keep responses concise and helpful.`;

  const userMessage = messages[messages.length - 1].content;
  const history = messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join("\n");
  
  const fullMessage = history ? `${history}\nuser: ${userMessage}` : userMessage;
  
  return callClaude(systemPrompt, fullMessage);
}