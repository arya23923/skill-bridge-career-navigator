import { useState, useEffect } from "react";
import { api } from "./api/client";
import UploadForm from "./components/UploadForm";
import Dashboard from "./components/Dashboard";
import type { AnalysisResult, ProfileRequest, Role } from "./types";

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({
  view,
  hasDashboard,
  onBuild,
  onDashboard,
}: {
  view: "build" | "dashboard";
  hasDashboard: boolean;
  onBuild: () => void;
  onDashboard: () => void;
}) {
  return (
    <nav
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        height: "58px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "2rem" }}>
        <div
          style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "var(--accent)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff",
          }}
        >
          S
        </div>
        <span style={{ fontWeight: 600, fontSize: "16px", letterSpacing: "-0.3px" }}>
          Skill<span style={{ color: "var(--accent)" }}>Bridge</span>
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px" }}>
        {(
          [
            { id: "build",     label: "Profile Builder" },
            { id: "dashboard", label: "Dashboard"       },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={t.id === "build" ? onBuild : onDashboard}
            disabled={t.id === "dashboard" && !hasDashboard}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: view === t.id ? 500 : 400,
              fontFamily: "var(--font)",
              cursor: t.id === "dashboard" && !hasDashboard ? "not-allowed" : "pointer",
              background: view === t.id ? "var(--accent-bg)" : "transparent",
              color:
                view === t.id
                  ? "var(--accent2)"
                  : t.id === "dashboard" && !hasDashboard
                  ? "var(--text3)"
                  : "var(--text2)",
              border:
                view === t.id
                  ? "1px solid rgba(108,99,255,0.25)"
                  : "1px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <span
        style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "var(--mono)" }}
      >
        Career Navigator v1.0
      </span>
    </nav>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]         = useState<"build" | "dashboard">("build");
  const [roles, setRoles]       = useState<Role[]>([]);
  const [skillsData, setSkillsData] = useState<Record<string, string[]>>({});
  const [profile, setProfile]   = useState<ProfileRequest | null>(null);
  const [result, setResult]     = useState<AnalysisResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Fetch reference data on mount
  useEffect(() => {
    api.getRoles().then(setRoles).catch(() => {});
    api.getSkills().then((d) => setSkillsData(d.categories ?? {})).catch(() => {});
  }, []);

  async function handleAnalyse(profileData: ProfileRequest) {
    setLoading(true);
    setError("");
    setProfile(profileData);

    try {
      const res = await api.analyseProfile(profileData);
      setResult(res);
      setView("dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  function handleEdit() {
    setView("build");
    setError("");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav
        view={view}
        hasDashboard={!!result}
        onBuild={() => setView("build")}
        onDashboard={() => result && setView("dashboard")}
      />

      <main
        style={{
          flex: 1,
          padding: "2rem 1rem",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {view === "build" && (
          <UploadForm
            roles={roles}
            skillsData={skillsData}
            onSubmit={handleAnalyse}
            loading={loading}
            error={error}
            initialProfile={profile}
          />
        )}

        {view === "dashboard" && result && profile && (
          <Dashboard result={result} profile={profile} onEdit={handleEdit} />
        )}
      </main>
    </div>
  );
}