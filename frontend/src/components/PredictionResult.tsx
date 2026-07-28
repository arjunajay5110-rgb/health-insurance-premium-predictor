'use client';

import React, { useState } from 'react';
import { PredictionResultData, CurrencyConfig } from '@/types';
import { RefreshCw, CheckCircle2, Clock, Cpu, Globe } from 'lucide-react';

interface PredictionResultProps {
  data: PredictionResultData;
  onReset: () => void;
}

export default function PredictionResult({ data, onReset }: PredictionResultProps) {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');

  // Fallback exchange rates if not returned by backend (Base: USD = 1.0)
  const fallbackRates: Record<string, CurrencyConfig> = {
    USD: { rate: 1.0, symbol: '$', flag: '🇺🇸', name: 'USD ($)' },
    INR: { rate: 85.0, symbol: '₹', flag: '🇮🇳', name: 'INR (₹)' },
    EUR: { rate: 0.92, symbol: '€', flag: '🇪🇺', name: 'EUR (€)' },
    GBP: { rate: 0.79, symbol: '£', flag: '🇬🇧', name: 'GBP (£)' },
    AED: { rate: 3.67, symbol: 'د.إ', flag: '🇦🇪', name: 'AED (د.إ)' },
    CAD: { rate: 1.37, symbol: 'C$', flag: '🇨🇦', name: 'CAD (C$)' },
    AUD: { rate: 1.53, symbol: 'A$', flag: '🇦🇺', name: 'AUD (A$)' },
    SGD: { rate: 1.34, symbol: 'S$', flag: '🇸🇬', name: 'SGD (S$)' },
    JPY: { rate: 155.0, symbol: '¥', flag: '🇯🇵', name: 'JPY (¥)' },
  };

  const rates = data.exchange_rates || fallbackRates;
  const currentConfig = rates[selectedCurrencyCode] || rates['USD'];

  // Base premium in USD from backend
  const baseUsd = data.estimated_premium || 0;
  
  // Converted premium value
  const convertedValue = baseUsd * currentConfig.rate;

  // Format currency value based on currency code
  const formatCurrencyValue = (val: number, code: string, symbol: string) => {
    if (code === 'INR') {
      const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
      }).format(Math.round(val));
      return `${symbol}${formatted}`;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: code === 'JPY' ? 0 : 2,
      maximumFractionDigits: code === 'JPY' ? 0 : 2,
    }).format(val);
    return `${symbol}${formatted}`;
  };

  const displayFormattedPremium = formatCurrencyValue(convertedValue, selectedCurrencyCode, currentConfig.symbol);

  return (
    <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6 animate-in fade-in duration-300 transition-colors">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Prediction Result</h3>
        </div>

        <button
          onClick={onReset}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New Prediction
        </button>
      </div>

      {/* Primary Result Amount Display */}
      <div className="bg-gradient-to-br from-[#18181C] via-[#0F0F12] to-[#18181C] rounded-2xl p-6 sm:p-8 text-white space-y-3 text-center shadow-lg relative overflow-hidden border border-zinc-800">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Estimated Annual Premium
          </span>
        </div>

        <div className="text-4xl sm:text-5xl font-black text-white tracking-tight py-1 transition-all duration-200">
          {displayFormattedPremium}
        </div>

        {/* Currency Converter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-zinc-300">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Globe className="w-3.5 h-3.5 text-blue-400" /> Currency:
          </span>
          
          <select
            value={selectedCurrencyCode}
            onChange={(e) => setSelectedCurrencyCode(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 text-white font-medium text-xs border border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer transition-all shadow-xs"
          >
            {Object.entries(rates).map(([code, config]) => (
              <option key={code} value={code} className="bg-[#121215] text-white">
                {config.flag} {config.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model & Execution Stats */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Model Used</span>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{data.model}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Processing Time</span>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{data.processing_time_ms} ms</p>
          </div>
        </div>
      </div>

      {/* Input Summary */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
          Input Summary
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block">Age</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">{data.inputs.age} years</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block">Gender</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 capitalize">{data.inputs.gender}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block">BMI</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {data.inputs.bmi} {data.inputs.bmi_category_obese ? '(Obese)' : ''}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block">Smoker</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 capitalize">{data.inputs.smoker}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block">Children</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">{data.inputs.children}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block">Region</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 capitalize">{data.inputs.region}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
