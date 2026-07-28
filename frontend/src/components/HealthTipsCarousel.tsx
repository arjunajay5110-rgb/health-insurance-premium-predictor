'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const TIPS = [
  { icon: '💧', title: 'Hydration', text: 'Drink at least 8–10 glasses of water daily to maintain metabolic health and cardiovascular wellness.' },
  { icon: '🚶', title: 'Daily Activity', text: 'Aim for a 30-minute brisk walk daily to regulate blood pressure and support a healthy BMI.' },
  { icon: '🥗', title: 'Nutrition', text: 'Eat a balanced diet rich in leafy greens, whole grains, and lean proteins to reduce chronic health risks.' },
  { icon: '😴', title: 'Restorative Sleep', text: 'Maintain 7–8 hours of quality sleep to strengthen immune response and reduce stress hormones.' },
  { icon: '❤️', title: 'Preventive Care', text: 'Schedule annual preventive health checkups to detect potential medical conditions early.' },
  { icon: '🚭', title: 'Tobacco Cessation', text: 'Avoid tobacco products—quitting smoking significantly lowers insurance premiums and heart disease risk.' },
  { icon: '🧘', title: 'Stress Management', text: 'Practice mindfulness and deep breathing exercises to maintain emotional and cardiovascular balance.' },
];

export default function HealthTipsCarousel() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Pick random tip on initial load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TIPS.length);
    setCurrentIndex(randomIndex);
  }, []);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TIPS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TIPS.length);
  };

  const tip = TIPS[currentIndex];

  return (
    <section className="py-6 bg-slate-50/40 dark:bg-[#09090B] transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 dark:from-[#121215] dark:via-[#18181C] dark:to-[#121215] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-blue-800/40 dark:border-zinc-800 flex items-center justify-between gap-4">
          
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            aria-label="Previous Tip"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Tip Content */}
          <div className="flex-1 flex items-center gap-4 text-xs sm:text-sm animate-in fade-in duration-300">
            <div className="text-3xl shrink-0 p-2 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
              {tip.icon}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3 h-3" />
                <span>Daily Health Tip • {currentIndex + 1} of {TIPS.length}</span>
              </div>
              <h4 className="font-bold text-white text-sm">{tip.title}</h4>
              <p className="text-slate-300 text-xs leading-relaxed max-w-xl">{tip.text}</p>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            aria-label="Next Tip"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </section>
  );
}
