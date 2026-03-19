import { useState, useRef, useCallback } from "react";
import type { UploadState } from "../types";

interface UploadFormProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (text: string) => void;
  onError: (error: string) => void;
  uploadState: UploadState;
}

export function UploadForm({
  onAnalysisStart,
  onAnalysisComplete,
  onError,
  uploadState,
}: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
        onError("Please upload a .txt file or paste your resume text directly.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onAnalysisStart();
        onAnalysisComplete(text);
      };
      reader.onerror = () => onError("Failed to read file.");
      reader.readAsText(file);
    },
    [onAnalysisStart, onAnalysisComplete, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleTextSubmit = () => {
    if (pastedText.trim().length < 100) {
      onError("Please provide more resume content (at least 100 characters).");
      return;
    }
    onAnalysisStart();
    onAnalysisComplete(pastedText);
  };

  const isLoading =
    uploadState.status === "uploading" ||
    uploadState.status === "analyzing";

  return (
    <div className="upload-container">
      <div className="upload-header">
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M24 14v14M17 21l7-7 7 7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 34h20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="upload-title">Begin Your Journey</h2>
        <p className="upload-subtitle">Upload your resume and let AI map your career horizon</p>
      </div>

      <div className="mode-toggle">
        <button
          className={`mode-btn ${inputMode === "file" ? "active" : ""}`}
          onClick={() => setInputMode("file")}
        >
          Upload File
        </button>
        <button
          className={`mode-btn ${inputMode === "text" ? "active" : ""}`}
          onClick={() => setInputMode("text")}
        >
          Paste Text
        </button>
      </div>

      {inputMode === "file" ? (
        <div
          className={`drop-zone ${dragActive ? "drag-active" : ""} ${isLoading ? "loading" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />
          {isLoading ? (
            <div className="loading-state">
              <div className="orbit-loader">
                <div className="orbit-ring" />
                <div className="orbit-dot" />
              </div>
              <p className="loading-text">
                {uploadState.status === "uploading" ? "Reading resume..." : "Analyzing your profile..."}
              </p>
              <p className="loading-sub">SkillBridge AI is mapping your career DNA</p>
            </div>
          ) : (
            <div className="drop-content">
              <div className="drop-icon">📄</div>
              <p className="drop-main">Drop your resume here</p>
              <p className="drop-sub">or click to browse — .txt format</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-input-area">
          <textarea
            className="resume-textarea"
            placeholder="Paste your resume text here...&#10;&#10;Include your work experience, skills, education, and achievements for the best analysis."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={12}
            disabled={isLoading}
          />
          <div className="char-count">{pastedText.length} characters</div>
          <button
            className={`analyze-btn ${isLoading ? "loading" : ""}`}
            onClick={handleTextSubmit}
            disabled={isLoading || pastedText.trim().length < 100}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <span>Analyze Resume</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {uploadState.error && (
        <div className="error-banner">
          <span>⚠️</span>
          <span>{uploadState.error}</span>
        </div>
      )}

      
    </div>
  );
}