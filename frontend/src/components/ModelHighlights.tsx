'use client';

import React from 'react';
import { Cpu, Target, Layers, Zap } from 'lucide-react';

export default function ModelHighlights() {
  const highlights = [
    {
      title: 'LightGBM Engine',
      subtitle: 'Gradient Boosting Regressor',
      description: 'LGBMRegressor trained with random state seed matching notebook setup.',
      icon: Cpu,
      badge: 'Algorithm',
    },
    {
      title: 'Regression Target',
      subtitle: 'Annual Medical Charges ($)',
      description: 'Predicts continuous health insurance premium costs in USD.',
      icon: Target,
      badge: 'Objective',
    },
    {
      title: '7 Input Features',
      subtitle: 'Selected Feature Vector',
      description: 'age, isfemale, bmi, children, is_smoker, region_southeast, bmi_category_Obese.',
      icon: Layers,
      badge: 'Features',
    },
    {
      title: 'Fast Prediction',
      subtitle: 'Sub-10ms Inference',
      description: 'Optimized NumPy array transformations for zero latency responses.',
      icon: Zap,
      badge: 'Performance',
    },
  ];

  return (
    <section id="highlights" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Technical Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Model Highlights & Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-4 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wide">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{item.subtitle}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
