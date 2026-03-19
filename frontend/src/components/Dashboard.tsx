import { useState, useRef, useEffect } from "react";
import type { AnalysisResult, CareerPath, Message } from "../types";
import { chatWithAdvisor } from "../api/clients";

interface DashboardProps {
  analysis: AnalysisResult;
  onReset: () => void;
}

function SkillGapBar({ skill, currentLevel, requiredLevel, priority }: {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: string;
}) {
  const gap = requiredLevel - currentLevel;
  const priorityColors: Record<string, string> = {
    critical: "#ff4444",
    high: "#ff8800",
    medium: "#ffcc00",
    low: "#44cc88",
  };

  return (
    <div className="skill-gap-item">
      <div className="skill-gap-header">
        <span className="skill-name">{skill}</span>
        <span
          className="priority-badge"
          style={{ backgroundColor: priorityColors[priority] + "22", color: priorityColors[priority] }}
        >
          {priority}
        </span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-current"
          style={{ width: `${(currentLevel / 5) * 100}%` }}
        />
        <div
          className="skill-bar-gap"
          style={{
            left: `${(currentLevel / 5) * 100}%`,
            width: `${(gap / 5) * 100}%`,
            backgroundColor: priorityColors[priority] + "66",
          }}
        />
      </div>
      <div className="skill-levels">
        <span>Current: {currentLevel}/5</span>
        <span>Target: {requiredLevel}/5</span>
      </div>
    </div>
  );
}

function CareerCard({ path, isSelected, onClick }: {
  path: CareerPath;
  isSelected: boolean;
  onClick: () => void;
}) {
  const growthIcons = { high: "🚀", medium: "📈", low: "📊" };

  return (
    <div className={`career-card ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="career-card-header">
        <div className="match-score">
          <svg viewBox="0 0 36 36" className="score-ring">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="var(--accent)" strokeWidth="3"
              strokeDasharray={`${(path.matchScore / 100) * 94} 94`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className="score-num">{path.matchScore}%</span>
        </div>
        <div className="career-info">
          <h3 className="career-title">{path.title}</h3>
          {path.company && <span className="career-company">{path.company}</span>}
        </div>
        <span className="growth-badge">{growthIcons[path.growthPotential]}</span>
      </div>

      <p className="career-desc">{path.description}</p>

      <div className="career-meta">
        <div className="meta-item">
          <span className="meta-label">Salary</span>
          <span className="meta-value">
            ${(path.salary.min / 1000).toFixed(0)}k–${(path.salary.max / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Ready in</span>
          <span className="meta-value">{path.timeToReady}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Skill gaps</span>
          <span className="meta-value">{path.skillGaps.length}</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ analysis, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"paths" | "gaps" | "chat">("paths");
  const [selectedPath, setSelectedPath] = useState<CareerPath>(analysis.recommendedPaths[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi ${analysis.userProfile.name}! 👋 I've analyzed your resume. Your overall readiness score is **${analysis.overallReadinessScore}/100**. ${analysis.summary} What would you like to explore?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await chatWithAdvisor(apiMessages, analysis);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-profile">
          <div className="avatar">
            {analysis.userProfile.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h3 className="profile-name">{analysis.userProfile.name}</h3>
            <p className="profile-role">{analysis.userProfile.currentRole}</p>
          </div>
        </div>

        <div className="readiness-block">
          <div className="readiness-label">Career Readiness</div>
          <div className="readiness-bar-track">
            <div
              className="readiness-bar-fill"
              style={{ width: `${analysis.overallReadinessScore}%` }}
            />
          </div>
          <div className="readiness-score">{analysis.overallReadinessScore}/100</div>
        </div>

        <div className="sidebar-skills">
          <h4 className="sidebar-section-label">Top Skills to Learn</h4>
          <div className="skill-chips">
            {analysis.topSkillsToLearn.slice(0, 6).map((skill) => (
              <span key={skill} className="skill-chip">{skill}</span>
            ))}
          </div>
        </div>

        <nav className="sidebar-nav">
          {(["paths", "gaps", "chat"] as const).map((tab) => (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="nav-icon">
                {tab === "paths" ? "🗺️" : tab === "gaps" ? "📊" : "💬"}
              </span>
              <span className="nav-label">
                {tab === "paths" ? "Career Paths" : tab === "gaps" ? "Skill Gaps" : "AI Advisor"}
              </span>
            </button>
          ))}
        </nav>

        <button className="reset-btn" onClick={onReset}>
          ← New Analysis
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === "paths" && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Recommended Career Paths</h2>
              <p>Based on your profile and market demand</p>
            </div>
            <div className="career-grid">
              {analysis.recommendedPaths.map((path) => (
                <CareerCard
                  key={path.title}
                  path={path}
                  isSelected={selectedPath.title === path.title}
                  onClick={() => setSelectedPath(path)}
                />
              ))}
            </div>

            {selectedPath && (
              <div className="path-detail">
                <h3 className="detail-title">Required Skills: {selectedPath.title}</h3>
                <div className="required-skills">
                  {selectedPath.requiredSkills.map((skill) => (
                    <span key={skill} className="req-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "gaps" && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Skill Gap Analysis</h2>
              <p>For: {selectedPath.title}</p>
            </div>
            <div className="path-selector">
              {analysis.recommendedPaths.map((path) => (
                <button
                  key={path.title}
                  className={`path-select-btn ${selectedPath.title === path.title ? "active" : ""}`}
                  onClick={() => setSelectedPath(path)}
                >
                  {path.title}
                </button>
              ))}
            </div>
            <div className="skill-gaps-list">
              {selectedPath.skillGaps.map((gap) => (
                <SkillGapBar key={gap.skill} {...gap} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="chat-container">
            <div className="chat-header">
              <div className="advisor-avatar">🤖</div>
              <div>
                <h3>SkillBridge AI Advisor</h3>
                <p className="online-status">● Online</p>
              </div>
            </div>
            <div className="messages-area">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-bubble">{msg.content}</div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message assistant">
                  <div className="message-bubble typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
              <input
                className="chat-input"
                type="text"
                placeholder="Ask about your career path..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isTyping}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={isTyping || !inputValue.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10l14-7-7 14V10H3z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}