'use client';

import React from 'react';
import { HealthSnapshotData } from '@/types';
import { Lightbulb, CheckCircle2, AlertCircle, Heart, Shield } from 'lucide-react';

interface PersonalizedSuggestionsProps {
  snapshot: HealthSnapshotData;
}

export default function PersonalizedSuggestions({ snapshot }: PersonalizedSuggestionsProps) {
  const suggestions: { title: string; desc: string; icon: any; color: string }[] = [];

  // 1. BMI Suggestion
  if (snapshot.bmi >= 18.5 && snapshot.bmi <= 24.9) {
    suggestions.push({
      title: 'Healthy BMI',
      desc: 'Your BMI is within a healthy range. Continue maintaining your current balanced lifestyle.',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    });
  } else if (snapshot.bmi > 24.9) {
    suggestions.push({
      title: 'BMI Management',
      desc: 'Improving nutrition and maintaining regular physical activity may support better long-term health.',
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    });
  } else {
    suggestions.push({
      title: 'Underweight BMI',
      desc: 'Consider consulting a healthcare provider regarding balanced nutritional plans.',
      icon: AlertCircle,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    });
  }

  // 2. Smoking Suggestion
  if (snapshot.smoker === 'yes') {
    suggestions.push({
      title: 'Smoking Cessation',
      desc: 'Quitting smoking provides significant long-term health benefits and lowers health risks.',
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    });
  } else {
    suggestions.push({
      title: 'Non-Smoker Status',
      desc: 'Being a non-smoker is a major positive health indicator that helps keep insurance costs lower.',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    });
  }

  // 3. Age Suggestion
  if (snapshot.age >= 50) {
    suggestions.push({
      title: 'Preventive Health Care',
      desc: 'Consider scheduling regular preventive health checkups and routine health screenings.',
      icon: Heart,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    });
  }

  // 4. Dependents Suggestion
  if (snapshot.children > 0) {
    suggestions.push({
      title: 'Family Coverage Planning',
      desc: 'If you have dependents, reviewing comprehensive family health insurance plans may be beneficial.',
      icon: Shield,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    });
  }

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5 transition-colors">
      
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Personalized Wellness Suggestions</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Educational lifestyle and health insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {suggestions.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${item.color}`}
            >
              <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs">{item.title}</h4>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
