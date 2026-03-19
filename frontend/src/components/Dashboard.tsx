import React, { useState } from "react";
import type {
  AnalysisResult,
  ProfileRequest,
  DashboardTab,
  RecommendedProject,
  Certification,
  RoadmapPhase,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Tiny shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function Panel({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
      <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text2)", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontFamily: "var(--font)", cursor: "pointer",
        background: active ? (color ? `${color}18` : "var(--bg4)") : "var(--bg3)",
        border: `1px solid ${active ? (color ?? "var(--border2)") : "var(--border)"}`,
        color: active ? (color ?? "var(--text)") : "var(--text3)",
        fontWeight: active ? 500 : 400,
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gauge
// ─────────────────────────────────────────────────────────────────────────────

function GaugeCircle({ pct, color }: { pct: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg viewBox="0 0 88 88" style={{ width: "88px", height: "88px" }}>
      <circle cx="44" cy="44" r={r} fill="none" stroke="var(--bg4)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="15" fontWeight="700" fontFamily="var(--font)">
        {pct}%
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Gap Analysis
// ─────────────────────────────────────────────────────────────────────────────

function GapAnalysisTab({ result }: { result: AnalysisResult }) {
  const [filter, setFilter] = useState<"all" | "matched" | "missing">("all");
  const [search, setSearch] = useState("");

  const allRequired = [
    ...result.matched_skills.map((s) => ({ skill: s, status: "matched" as const })),
    ...result.missing_skills.map((s) => ({ skill: s, status: "missing" as const })),
  ];

  const visible = allRequired
    .filter((s) => filter === "all" || s.status === filter)
    .filter((s) => s.skill.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Score cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {[
          { label: "Skills Matched", value: result.matched_skills.length, total: result.matched_skills.length + result.missing_skills.length, color: "var(--green)" },
          { label: "Skills Missing", value: result.missing_skills.length, total: result.matched_skills.length + result.missing_skills.length, color: "var(--red)" },
          { label: "Via Projects", value: result.skills_from_projects?.length ?? 0, total: result.matched_skills.length, color: "var(--teal)", sub: "skills from projects" },
          { label: "Match Rate", value: `${result.match_pct}%`, color: result.match_pct >= 70 ? "var(--green)" : result.match_pct >= 45 ? "var(--amber)" : "var(--red)", sub: "of requirements" },
        ].map((c) => (
          <div key={c.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.1rem 1.25rem" }}>
            <p style={{ fontSize: "11px", color: "var(--text3)", margin: "0 0 6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{c.label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 2px", color: c.color, lineHeight: 1 }}>
              {c.value}
              {"total" in c && typeof c.total === "number" && (
                <span style={{ fontSize: "13px", fontWeight: 400, color: "var(--text3)", marginLeft: "4px" }}>/{c.total}</span>
              )}
            </p>
            {c.sub && <p style={{ fontSize: "11px", color: "var(--text3)", margin: 0 }}>{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Strengths */}
      {(result.strengths?.length ?? 0) > 0 && (
        <Panel title="Your Strengths" icon="✦">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.strengths!.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px", background: "var(--green-bg)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(34,217,138,0.15)" }}>
                <span style={{ color: "var(--green)", fontSize: "13px", marginTop: "1px", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Priority gaps */}
      {(result.priority_missing?.length ?? 0) > 0 && (
        <Panel title="Priority Gaps — Learn These First" icon="🎯">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {result.priority_missing.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "var(--red-bg)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,82,82,0.2)" }}>
                <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255,82,82,0.15)", color: "var(--red)", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--mono)" }}>{i + 1}</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{s}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "10px" }}>
            Ranked by frequency across job postings in this role.
          </p>
        </Panel>
      )}

      {/* All skills grid */}
      <Panel title="All Required Skills" icon="◎">
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills…" style={{ flex: "1", minWidth: "160px", maxWidth: "240px", boxSizing: "border-box" }} />
          {(["all", "matched", "missing"] as const).map((f) => (
            <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "matched" ? "✓ Matched" : "✕ Missing"}
            </FilterBtn>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {visible.length === 0 && <p style={{ fontSize: "14px", color: "var(--text3)" }}>No skills match your filter.</p>}
          {visible.map(({ skill, status }) => {
            const fromProject = result.skills_from_projects?.includes(skill);
            const color = fromProject ? "var(--teal)" : status === "matched" ? "var(--green)" : "var(--red)";
            const bg = fromProject ? "var(--teal-bg)" : status === "matched" ? "var(--green-bg)" : "var(--red-bg)";
            const border = fromProject ? "rgba(0,201,212,0.25)" : status === "matched" ? "rgba(34,217,138,0.2)" : "rgba(255,82,82,0.2)";
            return (
              <span key={skill} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "100px", background: bg, border: `1px solid ${border}`, fontSize: "13px", fontWeight: 500, color }}>
                <span style={{ fontSize: "10px" }}>{status === "matched" ? "✓" : "✕"}</span>
                {skill}
                {fromProject && <span style={{ fontSize: "10px", opacity: 0.7 }}>·proj</span>}
              </span>
            );
          })}
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[{ color: "var(--green)", label: "✓ You have this" }, { color: "var(--teal)", label: "✓ Via project" }, { color: "var(--red)", label: "✕ Missing" }].map((l) => (
            <span key={l.label} style={{ fontSize: "12px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.color, display: "inline-block" }} />
              {l.label}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Roadmap
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_COLORS = [
  { color: "var(--accent)", bg: "var(--accent-bg)", border: "rgba(108,99,255,0.25)" },
  { color: "var(--teal)", bg: "var(--teal-bg)", border: "rgba(0,201,212,0.25)" },
  { color: "var(--green)", bg: "var(--green-bg)", border: "rgba(34,217,138,0.25)" },
];

function RoadmapTab({ phases }: { phases: RoadmapPhase[] }) {
  const [openPhase, setOpenPhase] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!phases || phases.length === 0) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)", fontSize: "15px" }}>No roadmap data available.</div>;
  }

  const totalActions = phases.reduce((s, p) => s + (p.actions?.length ?? 0), 0);
  const doneCount = Object.values(checked).filter(Boolean).length;

  function toggleCheck(pi: number, ai: number) {
    const key = `${pi}-${ai}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Progress bar */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text3)" }}>Your Progress</span>
            <span style={{ fontSize: "12px", color: "var(--text2)", fontFamily: "var(--mono)" }}>{doneCount} / {totalActions} actions</span>
          </div>
          <div style={{ height: "6px", background: "var(--bg4)", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${totalActions > 0 ? Math.round((doneCount / totalActions) * 100) : 0}%`, background: "var(--accent)", borderRadius: "100px", transition: "width 0.4s ease" }} />
          </div>
        </div>
        <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent)", minWidth: "48px", textAlign: "right", fontFamily: "var(--mono)" }}>
          {totalActions > 0 ? Math.round((doneCount / totalActions) * 100) : 0}%
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "23px", top: "40px", bottom: "40px", width: "1px", background: "var(--border)", zIndex: 0 }} />
        {phases.map((phase, i) => {
          const c = PHASE_COLORS[i % PHASE_COLORS.length];
          const isOpen = openPhase === i;
          const phaseActions = phase.actions ?? [];
          const phaseDone = phaseActions.filter((_, ai) => checked[`${i}-${ai}`]).length;

          return (
            <div key={i} style={{ position: "relative", zIndex: 1, marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setOpenPhase(isOpen ? -1 : i)}
                style={{ width: "100%", textAlign: "left", padding: "0", background: "none", border: "none", fontFamily: "var(--font)", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
              >
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: isOpen ? c.bg : "var(--bg3)", border: `2px solid ${isOpen ? c.color : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", fontSize: "14px", fontWeight: 700, color: isOpen ? c.color : "var(--text3)", fontFamily: "var(--mono)" }}>
                  {phaseDone === phaseActions.length && phaseActions.length > 0 ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1, background: isOpen ? c.bg : "var(--bg2)", border: `1px solid ${isOpen ? c.border : "var(--border)"}`, borderRadius: "var(--radius)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: isOpen ? c.color : "var(--text)" }}>{phase.title}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text3)", marginTop: "1px" }}>{phase.focus}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "var(--mono)" }}>{phaseDone}/{phaseActions.length}</span>
                    <span style={{ fontSize: "12px", color: isOpen ? c.color : "var(--text3)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div style={{ marginLeft: "60px", marginTop: "8px", background: "var(--bg2)", border: `1px solid ${c.border}`, borderRadius: "var(--radius)", overflow: "hidden" }}>
                  {phaseActions.map((action, ai) => {
                    const key = `${i}-${ai}`;
                    const done = !!checked[key];
                    return (
                      <div
                        key={ai}
                        onClick={() => toggleCheck(i, ai)}
                        style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 18px", borderBottom: ai < phaseActions.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", background: done ? "rgba(34,217,138,0.04)" : "transparent", transition: "background 0.15s" }}
                      >
                        <div style={{ width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0, marginTop: "1px", border: `1.5px solid ${done ? "var(--green)" : "var(--border2)"}`, background: done ? "var(--green-bg)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                          {done && <span style={{ fontSize: "11px", color: "var(--green)" }}>✓</span>}
                        </div>
                        <span style={{ fontSize: "14px", lineHeight: 1.6, color: done ? "var(--text3)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>
                          {action}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: "12px", color: "var(--text3)", textAlign: "center", paddingTop: "4px" }}>Click actions to mark complete · Click phase headers to expand</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Projects to Build
// ─────────────────────────────────────────────────────────────────────────────

const DIFF_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  Beginner:     { color: "var(--green)",  bg: "var(--green-bg)",  border: "rgba(34,217,138,0.2)" },
  Intermediate: { color: "var(--amber)",  bg: "var(--amber-bg)",  border: "rgba(245,166,35,0.2)" },
  Advanced:     { color: "var(--red)",    bg: "var(--red-bg)",    border: "rgba(255,82,82,0.2)"  },
};

function ProjectsTab({ projects, role }: { projects: RecommendedProject[]; role: string }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  if (!projects || projects.length === 0) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)", fontSize: "15px" }}>No recommended projects available.</div>;
  }

  const visible = projects
    .filter((p) => filter === "All" || p.difficulty === filter)
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tech_stack.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "20px", flexShrink: 0 }}>🚀</span>
        <p style={{ fontSize: "14px", color: "var(--text2)", margin: 0, lineHeight: 1.6 }}>
          These projects are specifically chosen to fill your skill gaps for <strong style={{ color: "var(--text)" }}>{role}</strong>. Build them in order of difficulty — each one compounds your portfolio impact.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects or tech…" style={{ flex: 1, minWidth: "200px", boxSizing: "border-box" }} />
        {["All", "Beginner", "Intermediate", "Advanced"].map((d) => (
          <FilterBtn key={d} active={filter === d} onClick={() => setFilter(d)} color={d !== "All" ? DIFF_COLOR[d]?.color : undefined}>
            {d}
          </FilterBtn>
        ))}
      </div>

      {visible.length === 0 && <p style={{ textAlign: "center", color: "var(--text3)", padding: "2rem", fontSize: "14px" }}>No projects match your filter.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
        {visible.map((proj, i) => {
          const dc = DIFF_COLOR[proj.difficulty] ?? DIFF_COLOR.Intermediate;
          const ICONS = ["🏗", "⚙️", "🎯"];
          return (
            <div
              key={i}
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "12px", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: dc.bg, border: `1px solid ${dc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                  {ICONS[i % ICONS.length]}
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "100px", background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`, flexShrink: 0 }}>{proj.difficulty}</span>
              </div>

              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.2px", lineHeight: 1.3 }}>{proj.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text2)", margin: 0, lineHeight: 1.6 }}>{proj.description}</p>
              </div>

              <div>
                <p style={{ fontSize: "11px", color: "var(--text3)", margin: "0 0 6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Tech Stack</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {proj.tech_stack.map((t) => (
                    <span key={t} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "4px", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", fontFamily: "var(--mono)" }}>{t}</span>
                  ))}
                </div>
              </div>

              {proj.impact && (
                <div style={{ padding: "10px 12px", background: "var(--accent-bg)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(108,99,255,0.15)" }}>
                  <p style={{ fontSize: "12px", color: "var(--accent2)", margin: 0, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600 }}>Why build it: </span>{proj.impact}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Certifications
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  Foundational: { color: "var(--green)",  bg: "var(--green-bg)",  border: "rgba(34,217,138,0.2)"  },
  Associate:    { color: "var(--teal)",   bg: "var(--teal-bg)",   border: "rgba(0,201,212,0.2)"   },
  Professional: { color: "var(--accent)", bg: "var(--accent-bg)", border: "rgba(108,99,255,0.2)"  },
};

const PROVIDER_EMOJI: Record<string, string> = {
  "Amazon Web Services": "☁️",
  "Linux Foundation": "🐧",
  "HashiCorp": "🔷",
  "Google Cloud": "🔵",
  "Google / TensorFlow": "🧠",
  "Meta / Coursera": "📘",
  "GitHub": "🐙",
  "IBM / Coursera": "🔬",
  "Linux Professional Institute": "🖥",
};

function CertificationsTab({ certs }: { certs: Certification[] }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  if (!certs || certs.length === 0) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)", fontSize: "15px" }}>No certification recommendations available.</div>;
  }

  const visible = certs
    .filter((c) => filter === "All" || c.level === filter)
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.provider.toLowerCase().includes(search.toLowerCase()) ||
      c.relevant_skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "20px", flexShrink: 0 }}>🏅</span>
        <p style={{ fontSize: "14px", color: "var(--text2)", margin: 0, lineHeight: 1.6 }}>
          Certifications are ranked by how many of your skill gaps they address. Start with <strong style={{ color: "var(--text)" }}>Foundational</strong>, then work up — each level compounds on the previous.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certifications…" style={{ flex: 1, minWidth: "200px", boxSizing: "border-box" }} />
        {["All", "Foundational", "Associate", "Professional"].map((l) => {
          const lc = LEVEL_COLOR[l];
          return (
            <FilterBtn key={l} active={filter === l} onClick={() => setFilter(l)} color={lc?.color}>
              {l}
            </FilterBtn>
          );
        })}
        {saved.length > 0 && <span style={{ fontSize: "12px", color: "var(--text3)", marginLeft: "4px" }}>{saved.length} saved</span>}
      </div>

      {visible.length === 0 && <p style={{ textAlign: "center", color: "var(--text3)", padding: "2rem", fontSize: "14px" }}>No certifications match your filter.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {visible.map((cert) => {
          const lc = LEVEL_COLOR[cert.level] ?? LEVEL_COLOR.Associate;
          const emoji = PROVIDER_EMOJI[cert.provider] ?? "📜";
          const isSaved = saved.includes(cert.id);
          return (
            <div key={cert.id} style={{ background: "var(--bg2)", border: `1px solid ${isSaved ? "rgba(108,99,255,0.3)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", display: "grid", gridTemplateColumns: "44px 1fr auto", gap: "16px", alignItems: "start", transition: "border-color 0.15s" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: lc.bg, border: `1px solid ${lc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                {emoji}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, margin: 0, lineHeight: 1.3, letterSpacing: "-0.2px" }}>{cert.name}</h3>
                  <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "100px", background: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, flexShrink: 0 }}>{cert.level}</span>
                  {cert.priority > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "100px", background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid rgba(245,166,35,0.2)", flexShrink: 0 }}>
                      Closes {cert.priority} gap{cert.priority !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: "12px", color: "var(--text3)", margin: "0 0 10px" }}>{cert.provider}</p>
                <p style={{ fontSize: "13px", color: "var(--text2)", margin: "0 0 10px", lineHeight: 1.6 }}>{cert.why_get_it}</p>

                {cert.addresses_gaps?.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "11px", color: "var(--text3)", margin: "0 0 5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Addresses your gaps</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {cert.addresses_gaps.map((s) => (
                        <span key={s} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(255,82,82,0.2)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                  {[{ icon: "⏱", label: `~${cert.study_weeks} weeks` }, { icon: "💰", label: cert.cost }].map((m) => (
                    <span key={m.label} style={{ fontSize: "12px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "11px" }}>{m.icon}</span>{m.label}
                    </span>
                  ))}
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: "12px", color: "var(--accent2)", textDecoration: "none" }}>
                    Learn more →
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSaved((prev) => prev.includes(cert.id) ? prev.filter((x) => x !== cert.id) : [...prev, cert.id])}
                title={isSaved ? "Remove from saved" : "Save"}
                style={{ width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0, background: isSaved ? "var(--accent-bg)" : "var(--bg3)", border: `1px solid ${isSaved ? "rgba(108,99,255,0.3)" : "var(--border)"}`, color: isSaved ? "var(--accent2)" : "var(--text3)", fontSize: "15px", fontFamily: "var(--font)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              >
                {isSaved ? "★" : "☆"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard (main export)
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "gap",      label: "Gap Analysis"    },
  { id: "roadmap",  label: "Roadmap"         },
  { id: "projects", label: "Projects to Build" },
  { id: "certs",    label: "Certifications"  },
];

interface DashboardProps {
  result: AnalysisResult;
  profile: ProfileRequest;
  onEdit: () => void;
}

export default function Dashboard({ result, profile, onEdit }: DashboardProps) {
  const [tab, setTab] = useState<DashboardTab>("gap");

  const ratingColor = { Strong: "var(--green)", Moderate: "var(--amber)", Developing: "var(--red)" }[result.rating] ?? "var(--text2)";
  const ratingBg    = { Strong: "var(--green-bg)", Moderate: "var(--amber-bg)", Developing: "var(--red-bg)" }[result.rating] ?? "var(--bg3)";

  const tabBadge = (id: DashboardTab) => {
    if (id === "gap")      return result.missing_skills?.length ? `${result.missing_skills.length} gaps` : undefined;
    if (id === "roadmap")  return result.roadmap_phases?.length ? `${result.roadmap_phases.length} phases` : undefined;
    if (id === "projects") return result.recommended_projects?.length?.toString();
    if (id === "certs")    return result.certifications?.length?.toString();
    return undefined;
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="fade-up" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem 2rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: "88px", height: "88px", flexShrink: 0 }}>
          <GaugeCircle pct={result.match_pct} color={ratingColor} />
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.5px", margin: 0 }}>{profile.name}</h1>
            <span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "100px", background: ratingBg, color: ratingColor, border: `1px solid ${ratingColor}33` }}>
              {result.rating}
            </span>
            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: result.ai_powered ? "var(--accent-bg)" : "var(--bg4)", color: result.ai_powered ? "var(--accent2)" : "var(--text3)", border: `1px solid ${result.ai_powered ? "rgba(108,99,255,0.25)" : "var(--border)"}`, fontFamily: "var(--mono)" }}>
              {result.ai_powered ? "AI" : "rule-based"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text2)", margin: "0 0 10px" }}>
            Target: <strong style={{ color: "var(--text)" }}>{result.role?.title}</strong>
            &nbsp;·&nbsp;{profile.experience_years}y exp
            &nbsp;·&nbsp;{profile.skills.length} skills
            &nbsp;·&nbsp;{profile.projects.length} project{profile.projects.length !== 1 ? "s" : ""}
          </p>
          <p style={{ fontSize: "14px", color: "var(--text2)", margin: 0, lineHeight: 1.6 }}>{result.summary}</p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Avg Salary",  value: result.role?.avg_salary },
            { label: "Open Roles",  value: result.role?.open_roles?.toLocaleString() },
            { label: "Demand",      value: result.role?.demand },
          ].map((k) => (
            <div key={k.label} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 14px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "var(--text3)", margin: "0 0 2px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{k.label}</p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "var(--text)" }}>{k.value}</p>
            </div>
          ))}
        </div>

        <button type="button" onClick={onEdit} style={{ padding: "8px 18px", borderRadius: "var(--radius-sm)", background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text2)", fontSize: "13px", fontFamily: "var(--font)", cursor: "pointer", alignSelf: "flex-start", flexShrink: 0 }}>
          Edit Profile
        </button>
      </div>

      {/* ── Quick wins ──────────────────────────────────────────────────────── */}
      {(result.quick_wins?.length ?? 0) > 0 && (
        <div className="fade-up-1" style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,201,212,0.06))", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "var(--radius)", padding: "14px 20px", marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>⚡</span>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent2)", margin: "0 0 4px" }}>Quick Wins</p>
            <p style={{ fontSize: "13px", color: "var(--text2)", margin: 0 }}>{result.quick_wins!.join("  ·  ")}</p>
          </div>
        </div>
      )}

      {/* ── Interview tip ────────────────────────────────────────────────────── */}
      {result.interview_tip && (
        <div className="fade-up-1" style={{ background: "var(--amber-bg)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "var(--radius)", padding: "14px 20px", marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>💡</span>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--amber)", margin: "0 0 4px" }}>Interview Tip</p>
            <p style={{ fontSize: "13px", color: "var(--text2)", margin: 0 }}>{result.interview_tip}</p>
          </div>
        </div>
      )}

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="fade-up-2" style={{ display: "flex", gap: "4px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "4px", marginBottom: "1.5rem", overflowX: "auto" }}>
        {TABS.map((t) => {
          const badge = tabBadge(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{ flex: 1, minWidth: "120px", padding: "9px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: tab === t.id ? 600 : 400, fontFamily: "var(--font)", background: tab === t.id ? "var(--bg4)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text2)", border: tab === t.id ? "1px solid var(--border2)" : "1px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {t.label}
              {badge && (
                <span style={{ marginLeft: "6px", fontSize: "10px", padding: "1px 6px", borderRadius: "100px", background: "var(--bg3)", color: "var(--text3)", fontWeight: 500 }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab panels ──────────────────────────────────────────────────────── */}
      <div className="fade-up-3">
        {tab === "gap"      && <GapAnalysisTab result={result} />}
        {tab === "roadmap"  && <RoadmapTab phases={result.roadmap_phases} />}
        {tab === "projects" && <ProjectsTab projects={result.recommended_projects} role={result.role?.title ?? ""} />}
        {tab === "certs"    && <CertificationsTab certs={result.certifications} />}
      </div>
    </div>
  );
}