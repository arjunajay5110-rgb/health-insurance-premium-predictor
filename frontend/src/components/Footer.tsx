'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#09090B] border-t border-slate-200/80 dark:border-zinc-800 py-6 transition-colors">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
        
        <div>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">Health Insurance Premium Predictor</span>
          <span className="ml-2">v1.2.0</span>
        </div>

        <div>
          Built with Next.js + FastAPI + LightGBM
        </div>

        <div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-800 dark:hover:text-zinc-200 transition-colors underline"
          >
            GitHub Repository
          </a>
        </div>

      </div>
    </footer>
  );
}
