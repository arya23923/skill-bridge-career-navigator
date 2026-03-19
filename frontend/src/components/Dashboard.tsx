import React, { useState, useEffect } from "react";
import type { AnalysisResponse, Certification } from "../types";
import { OverviewTab } from "./OverviewTab";
import { SkillsTab } from "./SkillsTab";
import { RoadmapTab } from "./RoadmapTab";
import { CertsTab } from "./CertsTab";
import { getCertifications } from "../api/client";
import { LayoutDashboard, Code2, Map, Award, RotateCcw, ChevronRight, Sparkles } from "lucide-react";

interface Props {
  data: AnalysisResponse;
  role: string;
  filename: string;
  onReset: () => void;
}

type Tab = "overview" | "skills" | "roadmap" | "certifications";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "overview",       label: "Overview",       Icon: LayoutDashboard },
  { id: "skills",         label: "Skills",         Icon: Code2 },
  { id: "roadmap",        label: "Roadmap",        Icon: Map },
  { id: "certifications", label: "Certifications", Icon: Award },
];

const scoreColor = (v: number) => v >= 75 ? "#00e5c8" : v >= 50 ? "#e8ff47" : "#ff3d6b";

export default function Dashboard({ data, role, filename, onReset }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [certs, setCerts] = useState<Certification[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

useEffect(() => {
  let cancelled = false;

  const fetchCerts = async () => {
    try {
      const data = await getCertifications(role);
      if (!cancelled) setCerts(data);
    } finally {
      if (!cancelled) setCertsLoading(false);
    }
  };

  fetchCerts();

  return () => {
    cancelled = true;
  };
}, [role]);

  const score = data.profile_score;

  return (
    <div className="min-h-screen bg-grid flex flex-col">
      {/* Orbs */}
      <div style={{
        position: "fixed", borderRadius: "50%", filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0, width: 384, height: 384, top: -120, right: -100,
        background: "radial-gradient(circle, rgba(0,229,200,0.06) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "fixed", borderRadius: "50%", filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0, width: 288, height: 288, bottom: -80, left: -80,
        background: "radial-gradient(circle, rgba(232,255,71,0.05) 0%, transparent 70%)",
      }} />

      {/* Header */}
      <header className="relative z-10 px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(232,255,71,0.12)", border: "1px solid rgba(232,255,71,0.25)" }}>
              <Sparkles size={15} color="#e8ff47" />
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "white", fontSize: 16 }}>
              Skills<span style={{ color: "#e8ff47" }}>Navigator</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-600 min-w-0">
            <span className="truncate max-w-36">{filename}</span>
            <ChevronRight size={12} />
            <span style={{ color: "#e8ff47" }} className="truncate max-w-40">{role}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
              style={{
                background: `${scoreColor(score)}12`,
                border: `1px solid ${scoreColor(score)}30`,
                color: scoreColor(score),
              }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor(score) }} />
              Score {score}/100
            </div>
            <button onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#718096", cursor: "pointer",
              }}>
              <RotateCcw size={12} /> New Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Role strip */}
      <div className="relative z-10 px-6 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(232,255,71,0.02)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">Target Role</p>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: "white" }}>{role}</h1>
          </div>
          <div className="flex gap-6 flex-wrap">
            {[
              { label: "Skills Found", value: data.extracted_skills.length,  color: "#e8ff47" },
              { label: "Matched",      value: data.matched_skills.length,     color: "#00e5c8" },
              { label: "To Learn",     value: data.missing_skills.length,     color: "#ff3d6b" },
              { label: "Projects",     value: data.extracted_projects.length, color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </p>
                <p className="text-xs font-mono text-gray-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 px-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex gap-1 py-2 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className={`tab-btn flex items-center gap-2 whitespace-nowrap ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}>
              <Icon size={13} />
              {label}
              {id === "certifications" && certs.length > 0 && (
                <span className="ml-0.5 text-xs font-mono px-1.5 py-0.5 rounded-full"
                  style={{
                    background: tab === id ? "rgba(232,255,71,0.2)" : "rgba(255,255,255,0.06)",
                    color: tab === id ? "#e8ff47" : "#718096",
                  }}>
                  {certs.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {tab === "overview"       && <OverviewTab data={data} />}
          {tab === "skills"         && <SkillsTab data={data} />}
          {tab === "roadmap"        && <RoadmapTab roadmap={data.roadmap} />}
          {tab === "certifications" && <CertsTab certifications={certs} loading={certsLoading} role={role} />}
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-gray-700 font-mono">
          <span>SkillsNavigator · AI-Powered Career Analysis</span>
          {data.ai_used && (
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5c8", animation: "pulse 2s infinite" }} />
              Gemini AI
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}