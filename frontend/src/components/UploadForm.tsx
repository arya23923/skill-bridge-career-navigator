import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'

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

interface Props {
  onSubmit: (file: File, role: string) => void
  loading: boolean
  error: string | null
}

export default function UploadForm({ onSubmit, loading, error }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [role, setRole] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isValidFile = (f: File): boolean => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    const validExts = ['pdf', 'docx']
    const validMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    return validExts.includes(ext ?? '') || validMimes.includes(f.type)
  }

  const handleFile = (f: File) => {
    if (!isValidFile(f)) {
      alert('Only PDF or DOCX files are supported.')
      return
    }
    setFile(f)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = ''
  }

  const canSubmit = file && role && !loading

  return (
    <div className=" bg-gray-900 text-w flex items-center justify-center px-5 py-10">
      <div className="w-full flex flex-col gap-4">
        <p className="text-sm text-white text-lg -mt-1">
          Drop your resume, pick your target role — we'll show you exactly what's missing and how to get there.
        </p>

        {/* Drop zone */}
        <div
          onClick={() => !file && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            border rounded-md px-5 py-10 text-center bg-white cursor-pointer
            transition-colors duration-150
            ${dragging ? 'border-gray-900 border-solid' : 'border-dashed border-gray-300'}
            ${file ? 'border-solid border-gray-900 cursor-default' : 'hover:border-gray-900'}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleChange}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center gap-3 text-left">
              <svg className="text-gray-500 shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="font-mono text-xs text-gray-900">{file.name}</span>
                <span className="text-[11px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="w-6 h-6 border border-gray-200 rounded text-gray-400 text-[11px] hover:border-red-300 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div>
              <span className="text-2xl text-gray-400 block mb-2">↑</span>
              <p className="text-sm text-gray-600 mb-1">Drop your resume here</p>
              <span className="text-xs text-gray-400">PDF or DOCX · Click to browse</span>
            </div>
          )}
        </div>

        {/* Role select */}
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 pr-9 bg-white border border-gray-300 rounded-md text-sm text-gray-900 appearance-none cursor-pointer focus:outline-none focus:border-gray-900 font-sans"
          >
            <option value="">Select your target role…</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[11px]">▾</span>
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-[13px]">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={() => canSubmit && onSubmit(file!, role)}
          disabled={!canSubmit}
          className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Analyzing your resume…
            </span>
          ) : (
            'Analyze Resume →'
          )}
        </button>

      </div>
    </div>
  )
}