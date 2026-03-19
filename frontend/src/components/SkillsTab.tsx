import React, { useState } from "react";
import type { AnalysisResponse } from "../types";
import { CheckCircle2, XCircle, Search } from "lucide-react";

interface SkillsTabProps { data: AnalysisResponse; }

export const SkillsTab: React.FC<SkillsTabProps> = ({ data }) => {
  const [filter, setFilter] = useState<"all" | "matched" | "missing">("all");
  const [search, setSearch] = useState("");

  const filtered = (list: string[]) =>
    search ? list.filter(s => s.toLowerCase().includes(search.toLowerCase())) : list;

  return (
    <div className="space-y-6 stagger">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#718096" }} />
          <input
            type="text" placeholder="Search skills…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-2 text-sm rounded-lg outline-none"
            style={{
              paddingLeft: 36, paddingRight: 16,
              background: "#161b24", border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "matched", "missing"] as const).map(f => (
            <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all"
                ? `All (${data.extracted_skills.length})`
                : f === "matched"
                ? `Matched (${data.matched_skills.length})`
                : `Missing (${data.missing_skills.length})`}
            </button>
          ))}
        </div>
      </div>

      {(filter === "all" || filter === "matched") && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 size={15} color="#00e5c8" />
            Matched Skills
            <span className="ml-auto font-mono text-xs" style={{ color: "#00e5c8" }}>
              {data.matched_skills.length} skills
            </span>
          </h3>
          {filtered(data.matched_skills).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filtered(data.matched_skills).map(s => (
                <span key={s} className="skill-tag matched">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No matched skills found.</p>
          )}
        </div>
      )}

      {(filter === "all" || filter === "missing") && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
            <XCircle size={15} color="#ff3d6b" />
            Missing Skills to Acquire
            <span className="ml-auto font-mono text-xs" style={{ color: "#ff3d6b" }}>
              {data.missing_skills.length} skills
            </span>
          </h3>
          {filtered(data.missing_skills).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filtered(data.missing_skills).map(s => (
                <span key={s} className="skill-tag missing">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">
              🎉 No missing skills detected! You're well-equipped.
            </p>
          )}
        </div>
      )}

      {filter === "all" && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-white text-sm mb-4">
            All Extracted Skills
            <span className="ml-2 font-mono text-xs text-gray-500">from your resume</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {filtered(data.extracted_skills).map(s => (
              <span key={s} className={`skill-tag ${data.matched_skills.includes(s) ? "matched" : "neutral"}`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Skills", value: data.extracted_skills.length, color: "#e8ff47" },
          { label: "Matched",      value: data.matched_skills.length,   color: "#00e5c8" },
          { label: "To Learn",     value: data.missing_skills.length,   color: "#ff3d6b" },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="font-display font-bold text-3xl" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-mono">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};