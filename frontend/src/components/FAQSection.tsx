'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Lock, Cpu, AlertTriangle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Is my personal health data stored on any server?',
      answer: 'No. We operate under a strict privacy-first policy. Input data is transmitted securely to the FastAPI backend solely to compute feature transformations and run inference in memory. No database, logs, or analytics tools store your personal inputs.',
      icon: Lock,
    },
    {
      question: 'How is the annual premium estimated?',
      answer: 'The prediction is generated using a trained LightGBM machine learning model. Your inputs (Age, Gender, BMI/Height/Weight, Children, Smoker Status, Region) are normalized via StandardScaler and passed to decision tree ensembles trained on historical medical cost data.',
      icon: Cpu,
    },
    {
      question: 'Is this an official health insurance quote?',
      answer: 'No. This application is an educational demonstration of machine learning regression pipelines. While predictions accurately reflect patterns in the trained dataset, actual health insurance underwriting depends on comprehensive medical evaluations, localized carrier rates, state policies, and benefit choices.',
      icon: AlertTriangle,
    },
    {
      question: 'Why does smoking status impact the premium significantly?',
      answer: 'In the underlying insurance dataset, smoking status exhibits the highest correlation with annual medical costs. The LightGBM model naturally weights tobacco usage as a primary decision split, resulting in higher estimated rates for smokers.',
      icon: HelpCircle,
    },
    {
      question: 'How is BMI calculated if I choose Height & Weight mode?',
      answer: 'If you enter height in centimeters and weight in kilograms, the application automatically computes BMI using the formula: BMI = weight (kg) / [height (m)]². The result is rounded to two decimal places and evaluated against the Obese category threshold (> 29.9) expected by the LightGBM model.',
      icon: HelpCircle,
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 mb-14">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" /> Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Everything you need to know about the prediction model, data privacy, and estimation methodology.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const IconComponent = faq.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-700 transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-3 text-base sm:text-lg">
                    <IconComponent className="w-5 h-5 text-emerald-600 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-200/50 pt-4 animate-in fade-in duration-200">
                    {faq.answer}
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
