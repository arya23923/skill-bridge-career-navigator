import React from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { AnalysisResponse } from "../types";
import { ScoreRing } from "./ScoreRing";
import { CheckCircle2, Briefcase, Brain } from "lucide-react";

interface OverviewTabProps { data: AnalysisResponse; }

interface TooltipPayloadItem {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs font-mono">
        <span style={{ color: "#e8ff47" }}>{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  const radarData = [
    { subject: "Profile",  value: data.profile_score },
    { subject: "Coverage", value: data.skill_coverage },
    { subject: "Projects", value: data.project_relevance },
    {
      subject: "Matched",
      value: data.matched_skills.length > 0
        ? Math.min(100, (data.matched_skills.length /
            (data.matched_skills.length + data.missing_skills.length)) * 100)
        : 0,
    },
    { subject: "Breadth", value: Math.min(100, data.extracted_skills.length * 4) },
  ];

  const pieData = [
    { name: "Matched", value: data.matched_skills.length, color: "#00e5c8" },
    { name: "Missing", value: data.missing_skills.length, color: "#ff3d6b" },
  ];

  const topMissing = data.missing_skills.slice(0, 8).map((s, i) => ({
    skill: s.length > 18 ? s.slice(0, 16) + "…" : s,
    priority: 100 - i * 10,
  }));

  return (
    <div className="space-y-6 stagger">
      {/* Score rings */}
      <div className="card p-6">
        <h3 className="font-display font-bold text-white text-base mb-6 flex items-center gap-2">
          <Brain size={16} color="#e8ff47" /> Profile Scores
        </h3>
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          <ScoreRing value={data.profile_score}    color="#e8ff47" label="Overall Score"    sublabel="Profile strength" />
          <ScoreRing value={data.skill_coverage}   color="#00e5c8" label="Skill Coverage"   sublabel="vs role requirements" />
          <ScoreRing value={data.project_relevance} color="#a78bfa" label="Project Relevance" sublabel="Practical experience" />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject"
                tick={{ fill: "#718096", fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Radar name="Score" dataKey="value"
                stroke="#e8ff47" fill="#e8ff47" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4">Skill Match Ratio</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%"
                innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-xs text-gray-400">
                  {d.name}: <span className="text-white font-mono">{d.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missing skills bar chart */}
      {topMissing.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4">Top Skills to Acquire</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topMissing} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]}
                tick={{ fill: "#718096", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" width={130}
                tick={{ fill: "#a0aec0", fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="priority" fill="#ff3d6b" radius={[0, 4, 4, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 size={15} color="#00e5c8" /> Your Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.strengths.map(s => (
              <span key={s} className="skill-tag neutral">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.extracted_projects.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
            <Briefcase size={15} color="#a78bfa" /> Projects Detected
          </h3>
          <div className="space-y-2">
            {data.extracted_projects.map((p, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="font-mono text-gray-600 mt-0.5 text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.ai_used && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Analysis powered by Gemini AI
        </div>
      )}
    </div>
  );
};