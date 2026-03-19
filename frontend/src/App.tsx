import { useState } from "react";
import { UploadForm } from "./components/UploadForm";
import { Dashboard } from "./components/Dashboard";
import { analyzeResume } from "./api/clients";
import type { AnalysisResult, UploadState } from "./types";
import "./index.css";

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });

  const handleAnalysisStart = () => {
    setUploadState({ status: "uploading", progress: 30 });
  };

  const handleResumeText = async (text: string) => {
    setUploadState({ status: "analyzing", progress: 60 });
    try {
      const result = await analyzeResume(text);
      setAnalysis(result);
      setUploadState({ status: "complete", progress: 100 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setUploadState({ status: "error", progress: 0, error: message });
    }
  };

  const handleError = (error: string) => {
    setUploadState({ status: "error", progress: 0, error });
  };

  const handleReset = () => {
    setAnalysis(null);
    setUploadState({ status: "idle", progress: 0 });
  };

  if (analysis && uploadState.status === "complete") {
    return (
      <div className="app">
        <header className="app-header compact">
          <div className="logo">
            <span className="logo-mark">◈</span>
            <span className="logo-text">SkillBridge</span>
          </div>
        </header>
        <Dashboard analysis={analysis} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <div className="landing-bg">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-grid" />
      </div>

      <div className="landing-hero">
        <div className="hero-text">
          <h1 className="hero-title">
            Map Your
            <br />
            <span className="hero-accent">Career Future</span>
          </h1>
          <p className="hero-desc">
            Upload your resume and get a personalized career roadmap,
            skill gap analysis.
          </p>
          
        </div>

        <div className="hero-form">
          <UploadForm
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleResumeText}
            onError={handleError}
            uploadState={uploadState}
          />
        </div>
      </div>
    </div>
  );
}