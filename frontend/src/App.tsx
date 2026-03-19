import { useState } from "react";
import UploadForm from "./components/UploadForm";
import { Dashboard } from "./components/Dashboard";
import { analyzeResume } from "./api/clients";
import type { AnalysisResponse } from "./types";
import "./index.css";

type AppState = "upload" | "loading" | "result"

export default function App() {
  const [appState, setAppState] = useState<AppState>("upload")
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (file: File, selectedRole: string) => {
    setAppState("loading")
    setError(null)
    try {
      const data = await analyzeResume(file, selectedRole)
      setResult(data)
      setAppState("result")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed"
      setError(message)
      setAppState("upload")
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setAppState("upload")
  }

  if (appState === "result" && result) {
    return <Dashboard analysis={result} onReset={handleReset} />
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-6xl font-bold mb-4">
            Map Your Career Future
      </h1>
      <p className="text-2xl">
              Upload your resume and get a personalized career roadmap,
              skill gap analysis.
      </p>
      <UploadForm
        onSubmit={handleSubmit}
        loading={appState === "loading"}
        error={error}
      />
    </div>
  )
}