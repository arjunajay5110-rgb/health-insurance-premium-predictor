'use client';

import React from 'react';
import { Award, Info } from 'lucide-react';

interface HealthScoreProps {
  score: number;
  status: string;
}

export default function HealthScore({ score, status }: HealthScoreProps) {
  const getBadgeStyle = (scoreVal: number) => {
    if (scoreVal >= 90) return { dot: '🟢', label: 'Excellent', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' };
    if (scoreVal >= 75) return { dot: '🟡', label: 'Good', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' };
    if (scoreVal >= 60) return { dot: '🟠', label: 'Moderate', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' };
    return { dot: '🔴', label: 'Needs Attention', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800' };
  };

  const badge = getBadgeStyle(score);

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4 transition-colors">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Health Score</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">General wellness indicator (0 - 100)</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.bg}`}>
          <span>{badge.dot}</span>
          <span className={badge.text}>{badge.label}</span>
        </span>
      </div>

      {/* Score Progress Gauge */}
      <div className="space-y-2 pt-2">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 dark:text-zinc-100">{score}<span className="text-xs font-normal text-slate-400"> / 100</span></span>
          <span className={`text-xs font-bold ${badge.text}`}>{badge.label} Profile</span>
        </div>

        <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-zinc-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 90 ? 'bg-emerald-500' : score >= 75 ? 'bg-blue-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Note */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 pt-1">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>This score is intended only as a general wellness indicator.</span>
      </div>

    </div>
  );
}
