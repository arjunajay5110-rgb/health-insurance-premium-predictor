'use client';

import React from 'react';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';

export default function Features() {
  const featureList = [
    {
      title: 'AI Prediction',
      description: 'Powered by a LightGBM Regressor trained on real-world medical cost dataset features, capturing complex interactions between age, BMI, and smoker status.',
      icon: Cpu,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Instant Results',
      description: 'Sub-millisecond inference pipeline with automated StandardScaler transformation. Instant response with zero latency or complex sign-ups.',
      icon: Zap,
      gradient: 'from-teal-500 to-blue-600',
      bgLight: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Privacy First',
      description: 'Zero data retention. Your health profile inputs are processed purely in-memory during inference and never saved to any database or third-party log.',
      icon: ShieldCheck,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider">
            Why Use AegisHealth ML
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Speed, Precision & Privacy
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Our machine learning architecture leverages exact notebook feature extraction and scaling rules to deliver accurate rate estimation without compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureList.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgLight} border flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span>Learn more</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
