'use client';

import React from 'react';
import { HealthSnapshotData } from '@/types';
import { User, Activity, Flame, Users, ShieldAlert, HeartPulse } from 'lucide-react';

interface HealthSnapshotProps {
  data: HealthSnapshotData;
}

export default function HealthSnapshot({ data }: HealthSnapshotProps) {
  // Format risk level color
  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'high':
        return 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Health Snapshot</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Personalized profile summary</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadge(data.risk_level)}`}>
          {data.risk_level} Risk
        </span>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
        
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Age</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{data.age} Years</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">BMI</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{data.bmi}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">BMI Status</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">{data.bmi_status}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Smoking</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm capitalize">
              {data.smoker === 'yes' ? 'Smoker' : 'Non-Smoker'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-zinc-800 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Dependents</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{data.children} Children</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-zinc-800 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Overall Risk</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{data.risk_level}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
