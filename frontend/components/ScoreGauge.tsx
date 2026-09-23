"use client";

import React from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ScoreGauge({
  score,
  size = 180,
  strokeWidth = 14,
  label = "ATS Score",
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let colorClass = "text-rose-500";
  let bgBadge = "bg-rose-50 text-rose-700 border-rose-200";
  let statusText = "Needs Revision";

  if (clampedScore >= 80) {
    colorClass = "text-emerald-500";
    bgBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
    statusText = "Excellent Alignment";
  } else if (clampedScore >= 60) {
    colorClass = "text-amber-500";
    bgBadge = "bg-amber-50 text-amber-700 border-amber-200";
    statusText = "Moderate Match";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-slate-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Center score label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-slate-900 tracking-tight">
            {clampedScore}
            <span className="text-xl font-bold text-slate-400">%</span>
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${bgBadge}`}>
        {statusText}
      </div>
    </div>
  );
}
