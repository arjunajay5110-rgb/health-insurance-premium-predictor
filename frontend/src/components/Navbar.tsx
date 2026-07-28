'use client';

import React from 'react';
import { Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full bg-white/90 dark:bg-[#09090B]/90 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 leading-tight">
              Health Insurance Premium Predictor
            </h1>
          </div>
        </div>

        {/* Right Side: Dark Mode Toggle & Badge */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80 text-xs font-semibold">
            AI ML Calculator
          </span>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700/80 transition-all flex items-center gap-1.5 text-xs font-medium"
            aria-label="Toggle Dark Mode"
            title="Toggle Dark / Light Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
