'use client';

import React, { useState, useEffect } from 'react';
import { PredictionInput, PredictionResultData } from '@/types';
import { predictPremium } from '@/lib/api';
import { Calculator, AlertCircle, Sparkles, Check } from 'lucide-react';
import PredictionResult from './PredictionResult';

export default function PredictionForm() {
  const [bmiMode, setBmiMode] = useState<'calculated' | 'direct'>('calculated');

  // Form Fields
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [smoker, setSmoker] = useState<'yes' | 'no'>('no');
  const [region, setRegion] = useState<'northeast' | 'northwest' | 'southeast' | 'southwest'>('southeast');
  const [children, setChildren] = useState<number>(1);
  
  // BMI Mode values
  const [bmi, setBmi] = useState<string>('24.5');
  const [heightCm, setHeightCm] = useState<string>('170');
  const [weightKg, setWeightKg] = useState<string>('70');

  // Derived BMI
  const [derivedBmi, setDerivedBmi] = useState<number>(24.22);
  const [bmiCategory, setBmiCategory] = useState<string>('Normal');

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResultData | null>(null);

  // Recalculate BMI automatically whenever height/weight change
  useEffect(() => {
    if (bmiMode === 'calculated') {
      const h = parseFloat(heightCm);
      const w = parseFloat(weightKg);
      if (h > 0 && w > 0) {
        const heightM = h / 100.0;
        const calc = w / (heightM * heightM);
        const rounded = Math.round(calc * 100) / 100;
        setDerivedBmi(rounded);
        setBmiCategory(getBmiCat(rounded));
      }
    } else {
      const b = parseFloat(bmi);
      if (b > 0) {
        setBmiCategory(getBmiCat(b));
      }
    }
  }, [heightCm, weightKg, bmi, bmiMode]);

  function getBmiCat(b: number): string {
    if (b < 18.5) return 'Underweight';
    if (b <= 24.9) return 'Normal';
    if (b <= 29.9) return 'Overweight';
    return 'Obese';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const startTime = Date.now();

    try {
      const payload: PredictionInput = {
        age,
        gender,
        smoker,
        region,
        children,
      };

      if (bmiMode === 'direct') {
        const numBmi = parseFloat(bmi);
        if (isNaN(numBmi) || numBmi < 10 || numBmi > 70) {
          throw new Error('Please enter a valid BMI between 10.0 and 70.0');
        }
        payload.bmi = numBmi;
      } else {
        const h = parseFloat(heightCm);
        const w = parseFloat(weightKg);
        if (isNaN(h) || h < 50 || h > 250) {
          throw new Error('Please enter a valid height in cm (50 - 250 cm)');
        }
        if (isNaN(w) || w < 20 || w > 300) {
          throw new Error('Please enter a valid weight in kg (20 - 300 kg)');
        }
        payload.height_cm = h;
        payload.weight_kg = w;
      }

      const res = await predictPremium(payload);

      // Short smooth animation delay (approx 500ms max)
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise((r) => setTimeout(r, 500 - elapsed));
      }

      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during prediction');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <section id="prediction-card" className="py-8 bg-white dark:bg-[#09090B] transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Render Result Card if available */}
        {result ? (
          <PredictionResult data={result} onReset={handleReset} />
        ) : (
          <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-zinc-800 shadow-xl relative overflow-hidden transition-colors">
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-blue-100 dark:border-zinc-800 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 absolute animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Analyzing your health profile...</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Running LightGBM inference & StandardScaler</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 flex items-center gap-3 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Title Header */}
            <div className="flex items-center gap-2.5 pb-6 mb-6 border-b border-slate-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">Health Profile Inputs</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Enter your metrics below to calculate annual premium rate</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. Age */}
                <div className="space-y-1.5">
                  <label htmlFor="age-input" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Age (Years)
                  </label>
                  <input
                    id="age-input"
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#18181C] focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all shadow-2xs"
                  />
                </div>

                {/* 2. Gender */}
                <div className="space-y-1.5">
                  <label htmlFor="gender-select" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Gender
                  </label>
                  <div id="gender-select" className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        gender === 'female'
                          ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 dark:border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      {gender === 'female' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      Female
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        gender === 'male'
                          ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 dark:border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      {gender === 'male' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      Male
                    </button>
                  </div>
                </div>

                {/* 3. Smoking Status */}
                <div className="space-y-1.5">
                  <label htmlFor="smoker-status" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Smoking Status
                  </label>
                  <div id="smoker-status" className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSmoker('no')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
                        smoker === 'no'
                          ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 dark:border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      Non-Smoker
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmoker('yes')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
                        smoker === 'yes'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 dark:border-amber-600 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                          : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      Smoker
                    </button>
                  </div>
                </div>

                {/* 4. Children / Dependents */}
                <div className="space-y-1.5">
                  <label htmlFor="children-input" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Children / Dependents
                  </label>
                  <input
                    id="children-input"
                    type="number"
                    min={0}
                    max={10}
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#18181C] focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all shadow-2xs"
                  />
                </div>

                {/* 5. Region */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="region-select" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Region
                  </label>
                  <div id="region-select" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'southeast', label: 'Southeast' },
                      { id: 'southwest', label: 'Southwest' },
                      { id: 'northeast', label: 'Northeast' },
                      { id: 'northwest', label: 'Northwest' },
                    ].map((reg) => (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => setRegion(reg.id as any)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          region === reg.id
                            ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 dark:border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                            : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80'
                        }`}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. BMI Section */}
                <div className="space-y-3 sm:col-span-2 bg-slate-50 dark:bg-[#18181C]/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Body Mass Index (BMI)</span>
                    <div className="inline-flex p-0.5 bg-slate-200/80 dark:bg-zinc-800 rounded-lg text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setBmiMode('calculated')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          bmiMode === 'calculated' ? 'bg-white dark:bg-[#121215] text-blue-700 dark:text-blue-400 shadow-2xs' : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        Height & Weight
                      </button>
                      <button
                        type="button"
                        onClick={() => setBmiMode('direct')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          bmiMode === 'direct' ? 'bg-white dark:bg-[#121215] text-blue-700 dark:text-blue-400 shadow-2xs' : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        Direct BMI
                      </button>
                    </div>
                  </div>

                  {bmiMode === 'calculated' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="height-input" className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">Height (cm)</label>
                          <input
                            id="height-input"
                            type="number"
                            step="0.5"
                            min={50}
                            max={250}
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 170"
                          />
                        </div>
                        <div>
                          <label htmlFor="weight-input" className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">Weight (kg)</label>
                          <input
                            id="weight-input"
                            type="number"
                            step="0.5"
                            min={20}
                            max={300}
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 70"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs p-2.5 bg-blue-50/80 dark:bg-zinc-800/80 rounded-lg border border-blue-100 dark:border-zinc-700">
                        <span className="text-blue-950 dark:text-zinc-200">Calculated BMI: <strong>{derivedBmi}</strong></span>
                        <span className="text-blue-700 dark:text-blue-400 font-semibold">{bmiCategory}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label htmlFor="direct-bmi" className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Enter BMI Value</label>
                      <input
                        id="direct-bmi"
                        type="number"
                        step="0.1"
                        min={10}
                        max={70}
                        value={bmi}
                        onChange={(e) => setBmi(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 24.5"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Estimate Premium</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </section>
  );
}
