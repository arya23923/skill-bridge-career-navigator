import React, { useEffect, useState } from "react";

interface ScoreRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  value,
  size = 130,
  strokeWidth = 8,
  color = "#e8ff47",
  label,
  sublabel,
}) => {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: size * 0.26, color }}
          >
            {Math.round(animated)}
          </span>
          <span className="text-xs text-gray-500 font-mono mt-1">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};