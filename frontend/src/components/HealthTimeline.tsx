'use client';

import React from 'react';
import { HealthSnapshotData } from '@/types';
import { CheckCircle, Circle, Milestone, Shield } from 'lucide-react';

interface HealthTimelineProps {
  snapshot: HealthSnapshotData;
}

export default function HealthTimeline({ snapshot }: HealthTimelineProps) {
  const milestones = [
    {
      title: 'Smoking Status',
      achieved: snapshot.smoker === 'no',
      achievedLabel: '✔ Non-Smoker Indicator',
      recommendedLabel: '○ Tobacco Cessation Plan',
      desc: snapshot.smoker === 'no' ? 'Positive non-tobacco indicator protecting respiratory health.' : 'Quitting smoking significantly reduces long-term health risks.',
    },
    {
      title: 'Body Mass Index',
      achieved: snapshot.bmi >= 18.5 && snapshot.bmi <= 24.9,
      achievedLabel: '✔ Healthy BMI Range',
      recommendedLabel: '○ Improve BMI Balance',
      desc: snapshot.bmi >= 18.5 && snapshot.bmi <= 24.9 ? 'BMI is in the healthy range (18.5–24.9).' : `Current BMI is ${snapshot.bmi} (${snapshot.bmi_status}). Balanced diet & activity recommended.`,
    },
    {
      title: 'Preventive Checkups',
      achieved: snapshot.health_score >= 80,
      achievedLabel: '✔ Regular Health Checkups',
      recommendedLabel: '○ Schedule Annual Screening',
      desc: 'Annual health screenings support early detection and wellness maintenance.',
    },
    {
      title: 'Family Health Security',
      achieved: snapshot.children > 0,
      achievedLabel: '✔ Dependents Protection Plan',
      recommendedLabel: '○ Consider Family Floater',
      desc: snapshot.children > 0 ? `Covered for ${snapshot.children} dependents under comprehensive plans.` : 'Individual policy protection active.',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5 transition-colors">
      
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Milestone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Health Milestone Timeline</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Achieved milestones & recommended health targets</p>
        </div>
      </div>

      <div className="space-y-4">
        {milestones.map((m, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs transition-all ${
              m.achieved
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
                : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
            }`}
          >
            {m.achieved ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${m.achieved ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'}`}>
                  {m.achieved ? m.achievedLabel : m.recommendedLabel}
                </span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
