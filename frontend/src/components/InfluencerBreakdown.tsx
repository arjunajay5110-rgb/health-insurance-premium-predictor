'use client';

import React from 'react';
import { HealthSnapshotData } from '@/types';
import { BarChart3, Info } from 'lucide-react';

interface InfluencerBreakdownProps {
  snapshot: HealthSnapshotData;
}

export default function InfluencerBreakdown({ snapshot }: InfluencerBreakdownProps) {
  // Compute relative impact bars
  const smokingImpact = snapshot.smoker === 'yes' ? 95 : 20;
  const bmiImpact = snapshot.bmi > 29.9 ? 85 : snapshot.bmi > 24.9 ? 60 : 30;
  const ageImpact = Math.min(95, Math.max(25, Math.round((snapshot.age / 65) * 100)));
  const childrenImpact = Math.min(80, 20 + snapshot.children * 15);
  const regionImpact = snapshot.region === 'southeast' ? 45 : 30;

  const factors = [
    { label: 'Smoking Status', impact: smokingImpact, color: snapshot.smoker === 'yes' ? 'bg-rose-500' : 'bg-blue-400' },
    { label: 'Body Mass Index (BMI)', impact: bmiImpact, color: snapshot.bmi > 29.9 ? 'bg-amber-500' : 'bg-emerald-500' },
    { label: 'Age Tier', impact: ageImpact, color: 'bg-indigo-500' },
    { label: 'Dependents / Children', impact: childrenImpact, color: 'bg-teal-500' },
    { label: 'Geographic Region', impact: regionImpact, color: 'bg-slate-400' },
  ];

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5 transition-colors">
      
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Estimated Premium Influencers</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Relative contribution of health factors to rate estimation</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {factors.map((f, i) => (
          <div key={i} className="space-y-1.5 text-xs">
            <div className="flex justify-between font-semibold text-slate-700 dark:text-zinc-300">
              <span>{f.label}</span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">{f.impact}% Impact</span>
            </div>
            
            <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-zinc-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${f.color}`}
                style={{ width: `${f.impact}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Visualization represents an approximate explanation of the estimated premium.</span>
      </div>

    </div>
  );
}
