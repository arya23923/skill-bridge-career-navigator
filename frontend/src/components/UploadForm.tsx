import React, { useState } from "react";
import type {
  ProfileRequest,
  Project,
  Role,
  ValidationErrors,
  ProjectErrors,
} from "../types";

// ── Demo profiles ─────────────────────────────────────────────────────────────

const DEMO_PROFILES: Record<string, ProfileRequest> = {
  "Cloud Engineer": {
    name: "Alex Chen",
    target_role_id: "cloud-engineer",
    experience_years: 2,
    skills: ["Python", "Linux", "Docker", "Git", "REST APIs"],
    projects: [
      {
        title: "Flask REST API",
        description: "Production REST API with auth and PostgreSQL",
        tech_stack: ["Python", "REST APIs", "SQL"],
        role: "Backend Developer",
        github_url: "",
      },
      {
        title: "Docker Compose App",
        description: "3-service app containerised with Docker Compose",
        tech_stack: ["Docker", "Linux"],
        role: "DevOps",
        github_url: "",
      },
    ],
  },
  "Data Scientist": {
    name: "Priya Nair",
    target_role_id: "data-scientist",
    experience_years: 3,
    skills: ["Python", "SQL", "Pandas", "Statistics", "Tableau"],
    projects: [
      {
        title: "Sales Forecasting Model",
        description: "Time-series model forecasting monthly sales with 89% accuracy",
        tech_stack: ["Python", "Pandas", "Statistics", "Data Visualization"],
        role: "Analyst",
        github_url: "",
      },
    ],
  },
  "Frontend Engineer": {
    name: "Jordan Lee",
    target_role_id: "frontend-engineer",
    experience_years: 1,
    skills: ["HTML", "CSS", "JavaScript", "Git", "Figma"],
    projects: [
      {
        title: "Portfolio Website",
        description: "Responsive portfolio with CSS animations and contact form",
        tech_stack: ["HTML", "CSS", "JavaScript"],
        role: "Designer/Developer",
        github_url: "",
      },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_PROJECT: Project = {
  title: "",
  description: "",
  tech_stack: [],
  role: "",
  github_url: "",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: "12px", color: "var(--text3)", marginBottom: "6px", fontWeight: 500, letterSpacing: "0.03em" }}>
      {children}
    </label>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px", margin: "4px 0 0" }}>
      {children}
    </p>
  );
}

function Chip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: { fg: string; bg: string; border: string };
  onClick: () => void;
}) {
  const activeStyle = color
    ? { background: color.bg, border: `1px solid ${color.border}`, color: color.fg }
    : { background: "var(--accent-bg)", border: "1px solid rgba(108,99,255,0.4)", color: "var(--accent2)" };
  const idleStyle = {
    background: "var(--bg3)",
    border: "1px solid var(--border2)",
    color: "var(--text2)",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: "100px",
        fontSize: "12px",
        fontFamily: "var(--font)",
        cursor: "pointer",
        transition: "all 0.1s",
        ...(active ? activeStyle : idleStyle),
      }}
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "13px", fontWeight: 500, color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "0.05em", margin: 0 }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
        {children}
      </div>
    </div>
  );
}

// ── ProjectCard ───────────────────────────────────────────────────────────────

function ProjectCard({
  index,
  project,
  errors,
  allSkills,
  onUpdate,
  onToggleTech,
  onRemove,
}: {
  index: number;
  project: Project;
  errors: ProjectErrors;
  allSkills: string[];
  onUpdate: (field: keyof Project, value: string | string[]) => void;
  onToggleTech: (skill: string) => void;
  onRemove: () => void;
}) {
  const [techSearch, setTechSearch] = useState("");
  const visible = allSkills
    .filter((s) => s.toLowerCase().includes(techSearch.toLowerCase()))
    .slice(0, 60);

  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "1.25rem", marginBottom: "12px" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontSize: "13px", color: "var(--text3)", fontFamily: "var(--mono)" }}>
          Project {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          style={{ background: "none", border: "none", color: "var(--text3)", fontSize: "18px", cursor: "pointer", fontFamily: "var(--font)", padding: "2px 6px" }}
        >
          ×
        </button>
      </div>

      {/* Title + Role */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <Label>Project Title *</Label>
          <input
            value={project.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="e.g. K8s Cluster on AWS"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          {errors.title && <ErrMsg>{errors.title}</ErrMsg>}
        </div>
        <div>
          <Label>Your Role</Label>
          <input
            value={project.role ?? ""}
            onChange={(e) => onUpdate("role", e.target.value)}
            placeholder="e.g. Backend Developer"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "12px" }}>
        <Label>Description</Label>
        <textarea
          value={project.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="What did you build and what was the impact?"
          rows={2}
          style={{ width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: "70px", fontFamily: "var(--font)", fontSize: "14px", background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text)", borderRadius: "var(--radius-sm)", padding: "10px 14px", outline: "none" }}
        />
      </div>

      {/* GitHub */}
      <div style={{ marginBottom: "12px" }}>
        <Label>GitHub URL (optional)</Label>
        <input
          value={project.github_url ?? ""}
          onChange={(e) => onUpdate("github_url", e.target.value)}
          placeholder="https://github.com/..."
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* Tech Stack */}
      <div>
        <Label>Tech Stack *</Label>
        {errors.tech_stack && <ErrMsg>{errors.tech_stack}</ErrMsg>}

        {/* Selected chips */}
        {project.tech_stack.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
            {project.tech_stack.map((s) => (
              <span
                key={s}
                onClick={() => onToggleTech(s)}
                style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "12px", background: "var(--teal-bg)", color: "var(--teal)", border: "1px solid rgba(0,201,212,0.25)", cursor: "pointer", fontWeight: 500 }}
              >
                {s} ×
              </span>
            ))}
          </div>
        )}

        <input
          value={techSearch}
          onChange={(e) => setTechSearch(e.target.value)}
          placeholder="Search technologies…"
          style={{ width: "100%", boxSizing: "border-box", marginBottom: "8px" }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
          {visible.map((s) => (
            <Chip
              key={s}
              label={s}
              active={project.tech_stack.includes(s)}
              color={{ fg: "var(--teal)", bg: "var(--teal-bg)", border: "rgba(0,201,212,0.3)" }}
              onClick={() => onToggleTech(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── UploadForm (main export) ──────────────────────────────────────────────────

interface UploadFormProps {
  roles: Role[];
  skillsData: Record<string, string[]>;
  onSubmit: (profile: ProfileRequest) => void;
  loading: boolean;
  error: string;
  initialProfile: ProfileRequest | null;
}

export default function UploadForm({
  roles,
  skillsData,
  onSubmit,
  loading,
  error,
  initialProfile,
}: UploadFormProps) {
  const [name, setName] = useState(initialProfile?.name ?? "");
  const [roleId, setRoleId] = useState(initialProfile?.target_role_id ?? "");
  const [expYears, setExpYears] = useState<number>(initialProfile?.experience_years ?? 0);
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills ?? []);
  const [projects, setProjects] = useState<Project[]>(initialProfile?.projects ?? []);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillCat, setSkillCat] = useState("All");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [projErrors, setProjErrors] = useState<ProjectErrors[]>([]);

  const allSkills = Object.values(skillsData).flat();
  const categories = ["All", ...Object.keys(skillsData)];
  const visibleSkills = allSkills
    .filter((s) => skillCat === "All" || (skillsData[skillCat] ?? []).includes(s))
    .filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()));

  // ── Load demo ───────────────────────────────────────────────────────────────
  function loadDemo(key: string) {
    const d = DEMO_PROFILES[key];
    setName(d.name);
    setRoleId(d.target_role_id);
    setExpYears(d.experience_years);
    setSkills(d.skills);
    setProjects(d.projects);
    setErrors({});
    setProjErrors([]);
  }

  // ── Skills ──────────────────────────────────────────────────────────────────
  function toggleSkill(s: string) {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    setErrors((e) => ({ ...e, skills: undefined }));
  }

  // ── Projects ────────────────────────────────────────────────────────────────
  function addProject() {
    setProjects((prev) => [...prev, { ...EMPTY_PROJECT }]);
  }

  function updateProject(i: number, field: keyof Project, value: string | string[]) {
    setProjects((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))
    );
    setProjErrors((prev) => {
      const next = [...prev];
      if (next[i]) next[i] = { ...next[i], [field]: undefined };
      return next;
    });
  }

  function toggleProjectTech(i: number, skill: string) {
    setProjects((prev) =>
      prev.map((p, idx) => {
        if (idx !== i) return p;
        const ts = p.tech_stack.includes(skill)
          ? p.tech_stack.filter((s) => s !== skill)
          : [...p.tech_stack, skill];
        return { ...p, tech_stack: ts };
      })
    );
  }

  function removeProject(i: number) {
    setProjects((prev) => prev.filter((_, idx) => idx !== i));
    setProjErrors((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: ValidationErrors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!roleId) e.role = "Please select a target role";
    if (skills.length === 0) e.skills = "Select at least one skill";
    if (expYears < 0) e.exp = "Cannot be negative";

    const pe: ProjectErrors[] = projects.map((p) => {
      const err: ProjectErrors = {};
      if (!p.title.trim()) err.title = "Title required";
      else if (p.title.trim().length < 3) err.title = "Title too short (min 3 chars)";
      if (p.tech_stack.length === 0) err.tech_stack = "Select at least one technology";
      return err;
    });

    setErrors(e);
    setProjErrors(pe);
    return (
      Object.keys(e).length === 0 &&
      pe.every((p) => Object.keys(p).length === 0)
    );
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      target_role_id: roleId,
      experience_years: Number(expYears),
      skills,
      projects,
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Heading */}
      <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: "0.5rem", margin: "0 0 0.5rem" }}>
          Build Your Profile
        </h1>
        <p style={{ color: "var(--text2)", fontSize: "15px", margin: 0 }}>
          Add your skills and projects — we'll analyse gaps and build your roadmap.
        </p>
      </div>

      {/* Demo shortcuts */}
      <div className="fade-up-1" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "2rem", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "var(--text3)" }}>Try a demo:</span>
        {Object.keys(DEMO_PROFILES).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => loadDemo(k)}
            style={{ padding: "6px 14px", borderRadius: "100px", fontSize: "12px", background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text2)", cursor: "pointer", fontFamily: "var(--font)" }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* 01 — Basic Info */}
      <div className="fade-up-1">
        <Section title="01 — Basic Info">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "start" }}>
            <div>
              <Label>Your Name *</Label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }}
                placeholder="e.g. Alex Chen"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              {errors.name && <ErrMsg>{errors.name}</ErrMsg>}
            </div>

            <div>
              <Label>Target Role *</Label>
              <select
                value={roleId}
                onChange={(e) => { setRoleId(e.target.value); setErrors((x) => ({ ...x, role: undefined })); }}
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                <option value="">Select a role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              {errors.role && <ErrMsg>{errors.role}</ErrMsg>}
            </div>

            <div style={{ minWidth: "100px" }}>
              <Label>Years Exp.</Label>
              <input
                type="number"
                min={0}
                max={40}
                value={expYears}
                onChange={(e) => { setExpYears(Number(e.target.value)); setErrors((x) => ({ ...x, exp: undefined })); }}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              {errors.exp && <ErrMsg>{errors.exp}</ErrMsg>}
            </div>
          </div>
        </Section>
      </div>

      {/* 02 — Skills */}
      <div className="fade-up-2">
        <Section title="02 — Skills">
          {errors.skills && <ErrMsg>{errors.skills}</ErrMsg>}

          {/* Category + search row */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search skills…"
              style={{ flex: "1", minWidth: "160px", maxWidth: "260px", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {categories.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={skillCat === c}
                  onClick={() => setSkillCat(c)}
                />
              ))}
            </div>
          </div>

          {/* Selected skills */}
          {skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px", padding: "12px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "100px", background: "var(--accent-bg)", border: "1px solid rgba(108,99,255,0.3)", color: "var(--accent2)", fontSize: "13px", fontWeight: 500 }}
                >
                  {s}
                  <span onClick={() => toggleSkill(s)} style={{ cursor: "pointer", opacity: 0.7, fontSize: "12px" }}>×</span>
                </span>
              ))}
            </div>
          )}

          {/* Skill grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", maxHeight: "200px", overflowY: "auto", padding: "4px" }}>
            {visibleSkills.slice(0, 80).map((s) => (
              <Chip
                key={s}
                label={s}
                active={skills.includes(s)}
                onClick={() => toggleSkill(s)}
              />
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "8px" }}>
            {skills.length} selected · Click to toggle
          </p>
        </Section>
      </div>

      {/* 03 — Projects */}
      <div className="fade-up-3">
        <Section title="03 — Projects">
          {projects.map((proj, i) => (
            <ProjectCard
              key={i}
              index={i}
              project={proj}
              errors={projErrors[i] ?? {}}
              allSkills={allSkills}
              onUpdate={(field, val) => updateProject(i, field, val)}
              onToggleTech={(skill) => toggleProjectTech(i, skill)}
              onRemove={() => removeProject(i)}
            />
          ))}
          <button
            type="button"
            onClick={addProject}
            style={{ width: "100%", padding: "14px", borderRadius: "var(--radius)", border: "1px dashed var(--border2)", background: "transparent", color: "var(--text2)", fontSize: "14px", fontFamily: "var(--font)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: projects.length > 0 ? "12px" : "0" }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>+</span> Add Project
          </button>
        </Section>
      </div>

      {/* API error banner */}
      {error && (
        <div style={{ background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.25)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "1rem", fontSize: "14px", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: "100%", padding: "16px", borderRadius: "var(--radius)", background: loading ? "var(--bg3)" : "var(--accent)", color: loading ? "var(--text3)" : "#fff", fontSize: "16px", fontWeight: 600, fontFamily: "var(--font)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", border: "none", letterSpacing: "-0.2px", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Analysing your profile…
          </>
        ) : (
          "Analyse My Profile →"
        )}
      </button>
    </div>
  );
}