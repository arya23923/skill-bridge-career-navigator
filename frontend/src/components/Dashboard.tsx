import { useEffect, useState } from "react"
import type { AnalysisResponse, Certification } from "../types"
import { fetchCertifications } from "../api/clients"

interface DashboardProps {
  analysis: AnalysisResponse
  onReset: () => void
}

function DonutChart({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const filled = (value / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 88 88" width="80" height="80">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#f0f0f0" strokeWidth="9" />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="44" y="49" textAnchor="middle" fill="#1a1a1a" fontSize="15"
          fontWeight="600" fontFamily="IBM Plex Sans, sans-serif">
          {value}
        </text>
      </svg>
      <span className="text-[11px] text-gray-400 text-center leading-tight max-w-[68px]">{label}</span>
    </div>
  )
}

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5 text-black">
      <span className="text-xs w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-xs text-gray-700 w-8 text-right shrink-0">{value}%</span>
    </div>
  )
}

type Phase = 'immediate' | 'short_term' | 'long_term'

export function Dashboard({ analysis, onReset }: DashboardProps) {
  const [activePhase, setActivePhase] = useState<Phase>('immediate')
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'roadmap' | 'certs'>('overview')

  useEffect(() => {
    // Try to get role from URL params or just fetch all certs — 
    // certs are fetched in Dashboard using extracted role context
    // We pass role through analysis strengths context
  }, [])

  const scoreColor =
    analysis.profile_score >= 70 ? '#2a7a4f'
    : analysis.profile_score >= 40 ? '#8a6500'
    : '#c33333'

  const matchedPct = analysis.matched_skills.length > 0
    ? Math.round((analysis.matched_skills.length /
        (analysis.matched_skills.length + analysis.missing_skills.length)) * 100)
    : 0

  const phases: Record<Phase, { label: string; items: string[] }> = {
    immediate: { label: 'Right Now',  items: analysis.roadmap.immediate  },
    short_term: { label: '3 Months',  items: analysis.roadmap.short_term },
    long_term:  { label: '6+ Months', items: analysis.roadmap.long_term  },
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'skills',   label: 'Skills'   },
    { key: 'roadmap',  label: 'Roadmap'  },
    { key: 'certs',    label: 'Certs'    },
  ] as const

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-black">

      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-7 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`font-mono text-[11px] px-2.5 py-1 rounded border
            ${analysis.ai_used
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-gray-400 bg-gray-50 border-gray-200'}`}>
            {analysis.ai_used ? '✦ AI Analysis' : '⚙ Fallback'}
          </span>
          <button
            onClick={onReset}
            className="text-sm text-gray-700 border border-gray-200 px-3 py-1 rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            ← New Analysis
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-200 px-7">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-[13px] border-b-2 transition-colors
                ${activeTab === tab.key
                  ? 'border-gray-900 text-gray-900 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-7 flex flex-col gap-4">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            <div className="bg-white border border-gray-200 rounded-md p-5">
              <p className="text-[15px] font-semibold text-black uppercase tracking-widest mb-4">
                Profile Score
              </p>
              <div className="grid grid-cols-3 gap-6 items-center">
                {/* Big ring */}
                <div className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 120 120" width="110" height="110">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="11" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={scoreColor} strokeWidth="11"
                      strokeDasharray={`${(analysis.profile_score / 100) * 314} 314`}
                      strokeLinecap="round" transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                    <text x="60" y="66" textAnchor="middle" fill="#1a1a1a" fontSize="26"
                      fontWeight="700" fontFamily="IBM Plex Sans, sans-serif">
                      {analysis.profile_score}
                    </text>
                  </svg>
                  <span className="text-[11px] text-gray-800 uppercase tracking-wider">Overall Score</span>
                </div>

                {/* Donuts */}
                <div className="flex justify-around">
                  <DonutChart value={analysis.skill_coverage}    color="#2a7a4f" label="Skill Coverage" />
                  <DonutChart value={analysis.project_relevance} color="#6366f1" label="Project Fit"    />
                  <DonutChart value={matchedPct}                  color="#8a6500" label="Skills Matched" />
                </div>

                {/* Bars */}
                <div className="flex flex-col gap-3">
                  <SkillBar label="Skill Coverage"    value={analysis.skill_coverage}    color="#2a7a4f" />
                  <SkillBar label="Project Relevance" value={analysis.project_relevance} color="#6366f1" />
                  <SkillBar label="Core Skills Met"   value={matchedPct}                 color="#8a6500" />
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  {analysis.strengths.map((s, i) => (
                    <span key={i} className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted info */}
            {analysis.extracted_projects.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-md p-5">
                <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-widest mb-4">
                  Extracted from Resume
                </p>
                <div className="flex flex-col gap-2">
                  {analysis.extracted_projects.map((p, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="font-mono text-[15px] text-gray-900 pt-0.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-gray-900 leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SKILLS TAB ── */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-md p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                Matched Skills
                <span className="font-mono font-normal normal-case tracking-normal text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-[11px]">
                  {analysis.matched_skills.length}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matched_skills.length > 0
                  ? analysis.matched_skills.map((s) => (
                      <span key={s} className="font-mono text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))
                  : <p className="text-sm text-gray-400">No skills matched yet</p>
                }
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                Missing Skills
                <span className="font-mono font-normal normal-case tracking-normal text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[11px]">
                  {analysis.missing_skills.length}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_skills.length > 0
                  ? analysis.missing_skills.map((s) => (
                      <span key={s} className="font-mono text-[11px] text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))
                  : <p className="text-sm text-gray-400">All core skills covered 🎉</p>
                }
              </div>
            </div>

            {/* All extracted skills */}
            <div className="bg-white border border-gray-200 rounded-md p-5 md:col-span-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                All Skills Found in Resume
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.extracted_skills.map((s) => (
                  <span key={s} className="font-mono text-[11px] text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROADMAP TAB ── */}
        {activeTab === 'roadmap' && (
          <div className="bg-white border border-gray-200 rounded-md p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Learning Roadmap
            </p>

            <div className="flex gap-1.5 mb-5 flex-wrap">
              {(Object.keys(phases) as Phase[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActivePhase(key)}
                  className={`px-3.5 py-1.5 text-[13px] border rounded transition-colors
                    ${activePhase === key
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900'}`}
                >
                  {phases[key].label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 mb-6">
              {phases[activePhase].items.map((item, i) => (
                <div key={i} className="flex gap-3.5 items-start">
                  <span className="font-mono text-xs text-gray-300 pt-0.5 shrink-0 w-5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            {analysis.roadmap.suggested_projects.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest mb-3">
                  Projects to Build
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {analysis.roadmap.suggested_projects.map((p, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded p-3 flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-gray-400 uppercase">Project {i + 1}</span>
                      <p className="text-[13px] text-gray-700 leading-snug">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CERTS TAB ── */}
        {activeTab === 'certs' && <CertsTab />}
      </div>
    </div>
  )
}

// Separate component so it can fetch certs with role from analysis
function CertsTab() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)

  const ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'ML Engineer', 'DevOps Engineer', 'Software Developer', 'QA Analyst',
    'AI/ML Engineer', 'Data Scientist', 'Cloud Architect', 'Cybersecurity Analyst',
    'Game Developer', 'Embedded Systems Engineer', 'Android Developer', 'iOS Developer',
    'Blockchain Developer', 'Smart Contract Developer', 'Web3 Developer',
    'AR/VR Developer', 'Desktop Application Developer', 'Systems Programmer',
    'Compiler Engineer', 'Graphics Engineer', 'Audio Engineer', 'Firmware Engineer',
    'Data Engineer', 'Data Analyst', 'MLOps Engineer', 'NLP Engineer',
    'Computer Vision Engineer', 'AI Research Engineer', 'Business Intelligence Developer',
    'Analytics Engineer', 'Site Reliability Engineer', 'Platform Engineer',
    'Infrastructure Engineer', 'Database Administrator', 'Network Engineer',
    'Linux Systems Administrator', 'Penetration Tester', 'Security Engineer',
    'Application Security Engineer', 'UI Engineer', 'UX Engineer',
    'Design Systems Engineer', 'API Developer', 'SDK Developer',
    'Technical Lead', 'Solutions Architect', 'Developer Advocate', 'Open Source Engineer',
  ]

  const fetchCerts = async (selectedRole: string) => {
    if (!selectedRole) return
    setLoading(true)
    const data = await fetchCertifications(selectedRole)
    setCerts(data)
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Recommended Certifications
      </p>

      <div className="relative mb-4">
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); fetchCerts(e.target.value) }}
          className="w-full px-3 py-2.5 pr-9 bg-white border border-gray-300 rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:border-gray-900"
        >
          <option value="">Select a role to see certifications…</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[11px]">▾</span>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {certs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {certs.map((c, i) => (
            <a
              key={i}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 transition-colors no-underline"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[13px] text-gray-900 leading-snug">{c.name}</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 uppercase border
                  ${c.level === 'beginner'     ? 'text-green-700 bg-green-50 border-green-200'  : ''}
                  ${c.level === 'intermediate' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : ''}
                  ${c.level === 'advanced'     ? 'text-red-600 bg-red-50 border-red-200'         : ''}
                `}>
                  {c.level}
                </span>
              </div>
              <span className="text-xs text-gray-400">{c.provider} ↗</span>
            </a>
          ))}
        </div>
      )}

      {!loading && role && certs.length === 0 && (
        <p className="text-sm text-gray-400">No certifications found for this role.</p>
      )}
    </div>
  )
}