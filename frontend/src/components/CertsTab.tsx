import React from "react";
import type { Certification } from "../types";
import { Award, ExternalLink, Loader2 } from "lucide-react";

interface CertsTabProps {
  certifications: Certification[];
  loading: boolean;
  role: string;
}

const levelColor: Record<string, { bg: string; text: string; border: string }> = {
  beginner:     { bg: "rgba(0,229,200,0.08)",   text: "#00e5c8", border: "rgba(0,229,200,0.25)"   },
  intermediate: { bg: "rgba(232,255,71,0.08)",  text: "#e8ff47", border: "rgba(232,255,71,0.25)"  },
  advanced:     { bg: "rgba(255,61,107,0.08)",  text: "#ff3d6b", border: "rgba(255,61,107,0.25)"  },
  associate:    { bg: "rgba(167,139,250,0.08)", text: "#a78bfa", border: "rgba(167,139,250,0.25)" },
  professional: { bg: "rgba(251,146,60,0.08)",  text: "#fb923c", border: "rgba(251,146,60,0.25)"  },
};

const providerColors: Record<string, string> = {
  Google: "#4285F4", AWS: "#FF9900", Microsoft: "#0078D4",
  Coursera: "#0056D2", Udemy: "#A435F0", edX: "#E01D48",
  LinkedIn: "#0A66C2", CompTIA: "#C8202A",
};

const getProviderColor = (provider: string) => {
  for (const [key, color] of Object.entries(providerColors)) {
    if (provider.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#718096";
};

const getLevelStyle = (level?: string) => {
  if (!level) return { bg: "rgba(255,255,255,0.05)", text: "#718096", border: "rgba(255,255,255,0.08)" };
  return levelColor[level.toLowerCase()] ??
    { bg: "rgba(255,255,255,0.05)", text: "#a0aec0", border: "rgba(255,255,255,0.1)" };
};

export const CertsTab: React.FC<CertsTabProps> = ({ certifications, loading, role }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={24} color="#e8ff47" className="animate-spin" />
        <p className="text-sm text-gray-500">Loading certifications for {role}…</p>
      </div>
    );
  }

  if (certifications.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Award size={28} color="#718096" />
        </div>
        <p className="text-gray-400 font-medium">No certifications found</p>
        <p className="text-gray-600 text-sm mt-1">
          for the <span style={{ color: "#e8ff47" }}>{role}</span> role
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 stagger">
      <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
        {certifications.length} certifications recommended for {role}
      </p>
      {certifications.map((cert, i) => {
        const lvl = getLevelStyle(cert.level);
        const providerColor = getProviderColor(cert.provider);
        return (
          <div key={i} className="card p-5 group hover:border-white/15 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: `${providerColor}18`,
                    border: `1px solid ${providerColor}30`,
                    color: providerColor,
                    fontFamily: "'Syne', sans-serif",
                  }}>
                  {cert.provider.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-sm leading-snug"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      {cert.name}
                    </h4>
                    {cert.level && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full capitalize"
                        style={{ background: lvl.bg, color: lvl.text, border: `1px solid ${lvl.border}` }}>
                        {cert.level}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: providerColor, opacity: 0.8 }}>
                    {cert.provider}
                  </p>
                  {cert.description && (
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{cert.description}</p>
                  )}
                </div>
              </div>
              {cert.url && cert.url !== "#" && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg flex-shrink-0 transition-all opacity-60 group-hover:opacity-100"
                  style={{
                    background: "rgba(232,255,71,0.08)",
                    border: "1px solid rgba(232,255,71,0.2)",
                    color: "#e8ff47",
                  }}>
                  View <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};