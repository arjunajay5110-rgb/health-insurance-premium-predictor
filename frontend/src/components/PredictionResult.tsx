'use client';

import React, { useEffect, useRef } from 'react';
import { PredictionResultData } from '@/types';
import { RefreshCw, CheckCircle2, Clock, Cpu, Sparkles } from 'lucide-react';
import HealthSnapshot from './HealthSnapshot';
import HealthScore from './HealthScore';
import BmiVisualization from './BmiVisualization';
import PersonalizedSuggestions from './PersonalizedSuggestions';

interface PredictionResultProps {
  data: PredictionResultData;
  onReset: () => void;
}

export default function PredictionResult({ data, onReset }: PredictionResultProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to result card after prediction
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);

  // Format Indian Rupees currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const annualDisplay = `₹ ${formatINR(data.annual_premium)}`;
  const monthlyDisplay = `₹ ${formatINR(data.monthly_premium)}`;

  return (
    <div ref={resultRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Main Premium Result Card */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Prediction Result</h3>
          </div>

          <button
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Prediction
          </button>
        </div>

        {/* Primary Hero Rate Display */}
        <div className="bg-gradient-to-br from-[#18181C] via-[#0F0F12] to-[#18181C] rounded-2xl p-6 sm:p-8 text-white text-center shadow-lg relative overflow-hidden border border-zinc-800 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estimated Health Insurance Premium</span>
          </div>

          {/* Annual & Monthly Displays */}
          <div className="space-y-1 py-2">
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {annualDisplay} <span className="text-lg text-slate-400 font-normal">/ Year</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {monthlyDisplay} <span className="text-xs text-slate-400 font-normal">/ Month</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto pt-1 border-t border-zinc-800/80">
            AI-generated premium estimate based on your health profile.
          </p>
        </div>

        {/* Technical Execution Badges */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-400 font-medium text-[11px]">Model Engine</span>
              <p className="font-bold text-slate-900 dark:text-zinc-100">{data.model}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-400 font-medium text-[11px]">Processing Time</span>
              <p className="font-bold text-slate-900 dark:text-zinc-100">{data.processing_time_ms} ms</p>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Health Snapshot Card */}
      <HealthSnapshot data={data.health_snapshot} />

      {/* 3. Health Score & BMI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthScore score={data.health_snapshot.health_score} status={data.health_snapshot.health_status} />
        <BmiVisualization bmi={data.health_snapshot.bmi} status={data.health_snapshot.bmi_status} />
      </div>

      {/* 4. Personalized Wellness Suggestions */}
      <PersonalizedSuggestions snapshot={data.health_snapshot} />

    </div>
  );
}
