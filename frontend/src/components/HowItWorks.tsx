'use client';

import React from 'react';
import { UserCheck, Sliders, Cpu, DollarSign, ArrowRight, Check } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'User Input',
      description: 'Enter your demographic and medical metrics (Age, Gender, BMI or Height & Weight, Children, Smoker Status, and Geographic Region).',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      step: '02',
      title: 'Preprocessing',
      description: 'The backend maps binary factors, calculates BMI Obese flag, and transforms numerical values using the exact StandardScaler fitted during training.',
      icon: Sliders,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      step: '03',
      title: 'LightGBM Model',
      description: 'The preprocessed feature vector is evaluated by the LightGBM Regressor ensemble model saved in insurance_lightgbm_model.pkl.',
      icon: Cpu,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      step: '04',
      title: 'Premium Prediction',
      description: 'The model outputs the estimated annual health insurance charges in USD along with input summary and execution performance metrics.',
      icon: DollarSign,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider">
            Machine Learning Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How The Prediction Pipeline Works
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Our full-stack architecture reproduces the exact notebook preprocessing logic from data ingestion to gradient-boosted decision tree inference.
          </p>
        </div>

        {/* 4-Step Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative flex flex-col justify-between space-y-6 hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Step {item.step}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl ${item.color} border flex items-center justify-center shadow-xs`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md text-xs">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
