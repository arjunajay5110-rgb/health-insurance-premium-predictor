'use client';

import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface HealthRiskGaugeProps {
  score: number;
  riskLevel: string;
  healthStatus: string;
}

export default function HealthRiskGauge({ score, riskLevel, healthStatus }: HealthRiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  // Gauge calculations (Circle circumference)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getRiskColors = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return {
          stroke: '#10B981', // emerald-500
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
          dot: '🟢',
        };
      case 'moderate':
        return {
          stroke: '#F59E0B', // amber-500
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300',
          dot: '🟡',
        };
      case 'high':
        return {
          stroke: '#EF4444', // rose-500
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300',
          dot: '🔴',
        };
      default:
        return {
          stroke: '#3B82F6',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-50 dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-blue-800 dark:text-blue-300',
          dot: '🔵',
        };
    }
  };

  const style = getRiskColors(riskLevel);

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Health Risk Gauge</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">AI-computed wellness score & risk level</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${style.badge}`}>
          <span>{style.dot}</span>
          <span>{riskLevel} Risk</span>
        </span>
      </div>

      {/* Gauge & Stats Container */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
        
        {/* Animated SVG Circular Progress Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-slate-100 dark:text-zinc-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated Gauge Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={style.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 dark:text-zinc-100">{animatedScore}</span>
            <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Text Breakdown */}
        <div className="space-y-3 text-center sm:text-left flex-1 max-w-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Overall Health Profile</span>
            <h4 className={`text-xl font-extrabold ${style.text}`}>{healthStatus} ({riskLevel} Risk)</h4>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed bg-slate-50 dark:bg-[#18181C] p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
            Your score is evaluated based on BMI, age tier, and smoking status. Higher scores reflect favorable long-term underwriting tiers.
          </p>
        </div>

      </div>

    </div>
  );
}
