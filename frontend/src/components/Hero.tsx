'use client';

import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-8 pb-6 bg-slate-50/60 dark:bg-[#09090B] border-b border-slate-200/60 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 text-blue-700 dark:text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>LightGBM ML Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
          Health Insurance Premium Predictor
        </h1>

        <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Estimate your annual health insurance premium in seconds using a trained AI model.
        </p>

        <div>
          <a
            href="#prediction-card"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            <span>Estimate Premium</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
