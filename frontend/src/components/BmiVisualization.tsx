'use client';

import React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';

interface BmiVisualizationProps {
  bmi: number;
  status: string;
}

export default function BmiVisualization({ bmi, status }: BmiVisualizationProps) {
  // Compute position percentage (10 to 45 BMI scale)
  const minBmi = 10;
  const maxBmi = 45;
  const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
  const percentage = Math.round(((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100);

  const getStatusBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'healthy':
      case 'normal':
        return { emoji: '🟢', text: 'Healthy Range', bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'underweight':
        return { emoji: '🔵', text: 'Underweight', bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'overweight':
        return { emoji: '🟡', text: 'Overweight', bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'obese':
        return { emoji: '🔴', text: 'Obese', bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
      default:
        return { emoji: '⚪', text: cat, bg: 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700' };
    }
  };

  const badge = getStatusBadge(status);

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5 transition-colors">
      
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">BMI Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Body Mass Index evaluation</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.bg}`}>
          <span>{badge.emoji}</span>
          <span>{status}</span>
        </span>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-3xl font-black text-slate-900 dark:text-zinc-100">{bmi}</span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 ml-2">kg/m²</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Healthy Range: 18.5 – 24.9</span>
        </div>
      </div>

      {/* Colored Progress Bar */}
      <div className="space-y-1.5 relative pt-4">
        {/* Pointer Pin */}
        <div
          className="absolute -top-1 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
          style={{ left: `${percentage}%` }}
        >
          <span className="text-[10px] font-bold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-1.5 py-0.5 rounded shadow-2xs">
            {bmi}
          </span>
          <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-900 dark:border-t-zinc-100" />
        </div>

        {/* Multi-segmented Bar */}
        <div className="h-3 w-full rounded-full overflow-hidden flex border border-slate-200/80 dark:border-zinc-700">
          <div className="w-[24%] bg-blue-400" title="Underweight (< 18.5)" />
          <div className="w-[18%] bg-emerald-500" title="Healthy (18.5 - 24.9)" />
          <div className="w-[15%] bg-amber-400" title="Overweight (25.0 - 29.9)" />
          <div className="w-[43%] bg-rose-500" title="Obese (≥ 30.0)" />
        </div>

        {/* Labels below bar */}
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 pt-1 font-medium">
          <span>&lt; 18.5 Underweight</span>
          <span>18.5–24.9 Healthy</span>
          <span>25.0–29.9 Overweight</span>
          <span>&ge; 30.0 Obese</span>
        </div>
      </div>

    </div>
  );
}
