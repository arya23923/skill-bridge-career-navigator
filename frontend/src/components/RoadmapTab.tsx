import React from "react";
import type { Roadmap } from "../types";
import { Zap, Calendar, Flag, Wrench } from "lucide-react";

interface RoadmapTabProps { roadmap: Roadmap; }

const phases = [
  {
    key: "immediate" as const,
    label: "Right Now", sublabel: "This week · Month 1",
    icon: Zap, color: "#e8ff47",
    bg: "rgba(232,255,71,0.06)", border: "rgba(232,255,71,0.2)", dot: "#e8ff47",
  },
  {
    key: "short_term" as const,
    label: "Short Term", sublabel: "Next 3 months",
    icon: Calendar, color: "#00e5c8",
    bg: "rgba(0,229,200,0.06)", border: "rgba(0,229,200,0.2)", dot: "#00e5c8",
  },
  {
    key: "long_term" as const,
    label: "Long Term", sublabel: "6+ months",
    icon: Flag, color: "#a78bfa",
    bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.2)", dot: "#a78bfa",
  },
];

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ roadmap }) => (
  <div className="space-y-6 stagger">
    {/* Timeline strip */}
    <div className="card p-4 flex items-center gap-2">
      {phases.map((p, i) => (
        <React.Fragment key={p.key}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.dot }} />
            <span className="text-xs font-mono" style={{ color: p.color }}>{p.label}</span>
          </div>
          {i < phases.length - 1 && (
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          )}
        </React.Fragment>
      ))}
    </div>

    {phases.map(phase => {
      const Icon = phase.icon;
      const items: string[] = roadmap[phase.key] || [];
      return (
        <div key={phase.key} className="rounded-xl p-6 transition-transform hover:-translate-y-0.5"
          style={{ background: phase.bg, border: `1px solid ${phase.border}` }}>
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${phase.color}18`, border: `1px solid ${phase.color}30` }}>
              <Icon size={16} color={phase.color} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">{phase.label}</h3>
              <p className="text-xs font-mono mt-0.5" style={{ color: phase.color, opacity: 0.8 }}>
                {phase.sublabel}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 group">
                <div className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all group-hover:scale-125"
                  style={{ background: phase.dot }} />
                <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-gray-600 italic">No actions available.</p>}
          </div>
        </div>
      );
    })}

    {roadmap.suggested_projects?.length > 0 && (
      <div className="card p-6">
        <h3 className="font-display font-bold text-white text-base mb-5 flex items-center gap-2">
          <Wrench size={15} color="#fb923c" />
          Suggested Projects to Build
          <span className="ml-auto text-xs font-mono text-gray-600">Impress hiring managers</span>
        </h3>
        <div className="space-y-3">
          {roadmap.suggested_projects.map((proj, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-lg"
              style={{ background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.12)" }}>
              <span className="font-display font-bold text-3xl leading-none"
                style={{ color: "rgba(251,146,60,0.2)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-gray-300 leading-relaxed self-center">{proj}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);