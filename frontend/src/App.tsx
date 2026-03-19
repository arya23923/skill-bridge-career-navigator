import { useState } from "react";
import { UploadStep as UploadForm } from "./components/UploadForm";
import { LoadingScreen } from "./components/LoadingScreen";
import Dashboard from "./components/Dashboard";
import { analyzeResume } from "./api/client";
import type { AnalysisResponse } from "./types";

type AppState = "upload" | "loading" | "results";

export default function App() {
  const [state, setState] = useState<AppState>("upload");
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [role, setRole] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (file: File, selectedRole: string) => {
    setError(null);
    setRole(selectedRole);
    setFilename(file.name);
    setState("loading");

    try {
      const data = await analyzeResume(file, selectedRole);
      setResults(data);
      setState("results");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setState("upload");
    }
  };

  const handleReset = () => {
    setResults(null);
    setRole("");
    setFilename("");
    setError(null);
    setState("upload");
  };

  if (state === "loading") return <LoadingScreen role={role} />;

  if (state === "results" && results) {
    return (
      <Dashboard
        data={results}
        role={role}
        filename={filename}
        onReset={handleReset}
      />
    );
  }

  return <UploadForm onSubmit={handleSubmit} loading={false} error={error} />;
}