'use client';

import React from 'react';

export default function AboutSection() {
  return (
    <section className="py-8 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/80 transition-colors">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          This application estimates health insurance premiums using a trained LightGBM machine learning model based on the Kaggle Medical Cost dataset. It is intended for educational and demonstration purposes.
        </p>
      </div>
    </section>
  );
}
