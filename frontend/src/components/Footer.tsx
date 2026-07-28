'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#09090B] border-t border-slate-200/80 dark:border-zinc-800 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Single Simple Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>This premium estimate is generated using artificial intelligence for educational purposes only and should not be considered an official insurance quotation.</span>
        </div>

        {/* Footer Meta Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80 pt-4">
          <div>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Health Insurance Premium Predictor</span>
            <span className="ml-2">v2.0.0</span>
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

      </div>
    </footer>
  );
}
