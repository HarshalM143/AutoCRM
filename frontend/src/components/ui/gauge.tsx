"use client";
import { useEffect, useState } from "react";

/** Signature element: an instrument-cluster gauge, echoing a tachometer redline.
 * Used on the login screen and as the dashboard's primary KPI motif. */
export function Gauge({
  value,
  max = 100,
  label,
  sublabel,
  size = 220,
  accent = "#FF5A1F",
}: {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: number;
  accent?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedValue(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  const radius = size / 2 - 14;
  const circumference = radius * 2 * Math.PI;
  const sweep = 0.75; // 270-degree gauge
  const arcLength = circumference * sweep;
  const pct = Math.min(animatedValue / max, 1);
  const offset = arcLength - arcLength * pct;

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={10}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold tabular text-white">{Math.round(animatedValue)}</span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/50 mt-1">{label}</span>
        {sublabel && <span className="text-[11px] text-white/35 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
