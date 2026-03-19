import React, { useEffect, useState } from "react";

const STEPS = [
  { label: "Parsing resume",       sub: "Extracting text content…" },
  { label: "Identifying skills",   sub: "Matching technical competencies…" },
  { label: "Calculating scores",   sub: "Benchmarking against role requirements…" },
  { label: "Generating roadmap",   sub: "Building your personalized plan…" },
];

export const LoadingScreen: React.FC<{ role: string }> = ({ role }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i), i * 1800));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center px-4">
      <div
        className="orb w-72 h-72"
        style={{
          position: "fixed",
          background: "radial-gradient(circle, rgba(232,255,71,0.1) 0%, transparent 70%)",
          top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none",
          animation: "pulse 3s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <svg className="w-full h-full" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none"
              stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="48" cy="48" r="40" fill="none"
              stroke="#e8ff47" strokeWidth="6" strokeLinecap="round"
              strokeDasharray="251" strokeDashoffset="180"
              style={{ transformOrigin: "center", animation: "spin 1.2s linear infinite" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full"
              style={{ background: "#e8ff47", boxShadow: "0 0 12px #e8ff47" }} />
          </div>
        </div>

        <h2 className="font-display font-bold text-white text-2xl mb-1">
          Analyzing your profile
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          for <span style={{ color: "#e8ff47" }}>{role}</span>
        </p>

        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-left p-3 rounded-lg transition-all duration-500"
              style={{
                background: i === step ? "rgba(232,255,71,0.06)" : "transparent",
                border: i === step ? "1px solid rgba(232,255,71,0.15)" : "1px solid transparent",
                opacity: i > step ? 0.3 : 1,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: i < step ? "#e8ff47" : i === step ? "rgba(232,255,71,0.2)" : "rgba(255,255,255,0.05)",
                  border: i === step ? "1px solid rgba(232,255,71,0.4)" : "none",
                }}
              >
                {i < step && (
                  <svg viewBox="0 0 10 10" width="10" height="10">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#06090f" strokeWidth="1.5"
                      fill="none" strokeLinecap="round" />
                  </svg>
                )}
                {i === step && (
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium"
                  style={{ color: i === step ? "#e8ff47" : i < step ? "#a0aec0" : "#4a5568" }}>
                  {s.label}
                </p>
                {i === step && <p className="text-xs text-gray-600 mt-0.5">{s.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};