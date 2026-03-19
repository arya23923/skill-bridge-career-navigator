import React, { useRef, useState } from "react";
import { Upload, FileText, ChevronDown, Sparkles, ArrowRight } from "lucide-react";

const ROLE_GROUPS: Record<string, string[]> = {
  "Web & Mobile": [
    "Frontend Developer","Backend Developer","Full Stack Developer",
    "UI Engineer","UX Engineer","Design Systems Engineer",
    "Android Developer","iOS Developer",
  ],
  "AI & Data": [
    "ML Engineer","AI/ML Engineer","Data Scientist","Data Engineer",
    "Data Analyst","MLOps Engineer","NLP Engineer",
    "Computer Vision Engineer","AI Research Engineer",
    "Business Intelligence Developer","Analytics Engineer",
  ],
  "Infrastructure & Cloud": [
    "DevOps Engineer","Cloud Architect","Site Reliability Engineer",
    "Platform Engineer","Infrastructure Engineer",
    "Database Administrator","Network Engineer","Linux Systems Administrator",
  ],
  "Security": [
    "Cybersecurity Analyst","Penetration Tester",
    "Security Engineer","Application Security Engineer",
  ],
  "Specialized": [
    "Game Developer","Embedded Systems Engineer","Blockchain Developer",
    "Smart Contract Developer","Web3 Developer","AR/VR Developer",
    "Desktop Application Developer","Systems Programmer",
    "Compiler Engineer","Graphics Engineer","Audio Engineer","Firmware Engineer",
  ],
  "Engineering Leadership": [
    "Software Developer","QA Analyst","API Developer","SDK Developer",
    "Technical Lead","Solutions Architect","Developer Advocate","Open Source Engineer",
  ],
};

interface UploadStepProps {
  onSubmit: (file: File, role: string) => void;
  loading: boolean;
  error: string | null;
}

export const UploadStep: React.FC<UploadStepProps> = ({ onSubmit, loading, error }) => {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith(".pdf") || dropped.name.endsWith(".docx"))) {
      setFile(dropped);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const canSubmit = !!file && !!role && !loading;

  return (
    <div className="min-h-screen bg-grid flex flex-col" style={{ position: "relative" }}>
      {/* Orbs */}
      <div style={{
        position: "fixed", borderRadius: "50%", filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0, width: 384, height: 384,
        top: -100, left: -100,
        background: "radial-gradient(circle, rgba(232,255,71,0.08) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "fixed", borderRadius: "50%", filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0, width: 320, height: 320,
        bottom: -80, right: -80,
        background: "radial-gradient(circle, rgba(0,229,200,0.07) 0%, transparent 70%)",
      }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(232,255,71,0.12)", border: "1px solid rgba(232,255,71,0.25)" }}>
            <Sparkles size={16} color="#e8ff47" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">
            Skills<span style={{ color: "#e8ff47" }}>Navigator</span>
          </span>
        </div>
        <span className="text-xs font-mono text-gray-600"
          style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 9999 }}>
          AI-Powered Career Analysis
        </span>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl stagger">
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-5xl text-white leading-tight mb-4">
              Map your path to<br />
              <span style={{ color: "#e8ff47" }}>your dream role</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
              Upload your resume, pick your target role, and get a personalized
              skill gap analysis with a step-by-step roadmap.
            </p>
          </div>

          <div className="card p-8 space-y-6">
            {/* Role */}
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">
                Target Role
              </label>
              <div className="relative">
                <select className="role-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="">Choose your target role…</option>
                  {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                    <optgroup key={group} label={group}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown size={16} color="#718096"
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">
                Resume
              </label>
              <div
                className={`upload-zone p-8 flex flex-col items-center gap-3 ${dragging ? "drag-over" : ""}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept=".pdf,.docx"
                  className="hidden" onChange={handleFile} />
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,229,200,0.1)", border: "1px solid rgba(0,229,200,0.25)" }}>
                      <FileText size={22} color="#00e5c8" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium text-sm">{file.name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {(file.size / 1024).toFixed(0)} KB — click to change
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Upload size={22} color="#718096" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-300 text-sm font-medium">Drop your resume here</p>
                      <p className="text-gray-600 text-xs mt-1">PDF or DOCX · max 10 MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg p-3 text-sm flex items-start gap-2"
                style={{ background: "rgba(255,61,107,0.08)", border: "1px solid rgba(255,61,107,0.2)", color: "#ff3d6b" }}>
                <span>⚠ {error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={() => file && role && onSubmit(file, role)}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display font-bold text-base tracking-tight transition-all duration-200"
              style={{
                background: canSubmit ? "#e8ff47" : "rgba(232,255,71,0.1)",
                color: canSubmit ? "#06090f" : "#4a5568",
                boxShadow: canSubmit ? "0 0 30px rgba(232,255,71,0.25)" : "none",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full inline-block"
                    style={{ animation: "spin 0.7s linear infinite" }} />
                  Analyzing resume…
                </>
              ) : (
                <>Analyze Resume <ArrowRight size={18} /></>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            Your resume is processed securely and never stored.
          </p>
        </div>
      </main>
    </div>
  );
};