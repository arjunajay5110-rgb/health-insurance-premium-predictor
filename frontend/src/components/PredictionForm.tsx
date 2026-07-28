'use client';

import React, { useState, useEffect } from 'react';
import { PredictionInput, PredictionResultData } from '@/types';
import { predictPremium, predictFamilyPremium } from '@/lib/api';
import { Calculator, AlertCircle, Sparkles, Check, User, Scale, Flame, Users, Plus, Trash2, Shield, RefreshCw, UserPlus } from 'lucide-react';
import PredictionResult from './PredictionResult';
import HealthRiskGauge from './HealthRiskGauge';
import HealthTimeline from './HealthTimeline';
import InfluencerBreakdown from './InfluencerBreakdown';
import InsuranceGlossary from './InsuranceGlossary';

interface PredictionFormProps {
  onPredictionSuccess?: (res: PredictionResultData | null) => void;
}

interface FamilyMemberForm {
  id: string;
  name: string;
  relationship: 'Primary' | 'Spouse' | 'Child' | 'Parent';
  age: number;
  gender: 'female' | 'male';
  smoker: 'yes' | 'no';
  heightCm: string;
  weightKg: string;
}

export default function PredictionForm({ onPredictionSuccess }: PredictionFormProps) {
  const [policyType, setPolicyType] = useState<'individual' | 'family'>('individual');
  const [bmiMode, setBmiMode] = useState<'calculated' | 'direct'>('calculated');

  // Individual Form Fields
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
  const [bmiCategory, setBmiCategory] = useState<string>('Healthy');

  // Family Members State
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberForm[]>([
    { id: '1', name: 'Primary Applicant', relationship: 'Primary', age: 35, gender: 'male', smoker: 'no', heightCm: '172', weightKg: '72' },
    { id: '2', name: 'Spouse', relationship: 'Spouse', age: 32, gender: 'female', smoker: 'no', heightCm: '162', weightKg: '58' },
  ]);

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResultData | null>(null);
  const [familyResult, setFamilyResult] = useState<any | null>(null);

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
    if (b <= 24.9) return 'Healthy';
    if (b <= 29.9) return 'Overweight';
    return 'Obese';
  }

  const getBmiBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'healthy':
        return { emoji: '🟢', text: 'Healthy', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'overweight':
        return { emoji: '🟡', text: 'Overweight', badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'obese':
        return { emoji: '🔴', text: 'Obese', badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
      default:
        return { emoji: '🟠', text: 'Underweight', badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    }
  };

  const bmiStyle = getBmiBadge(bmiCategory);

  // Dynamic Family Member Handlers
  const handleAddMember = (rel: 'Child' | 'Parent' | 'Spouse') => {
    const count = familyMembers.filter((m) => m.relationship === rel).length + 1;
    const nextId = Date.now().toString();

    let defaultAge = rel === 'Child' ? 8 : rel === 'Parent' ? 62 : 32;
    let defaultGender: 'female' | 'male' = rel === 'Parent' ? 'male' : 'female';

    setFamilyMembers([
      ...familyMembers,
      {
        id: nextId,
        name: rel === 'Child' ? `Child ${count}` : rel === 'Parent' ? `Parent ${count}` : `Spouse`,
        relationship: rel,
        age: defaultAge,
        gender: defaultGender,
        smoker: 'no',
        heightCm: rel === 'Child' ? '125' : '165',
        weightKg: rel === 'Child' ? '25' : '65',
      },
    ]);
  };

  const handleRemoveFamilyMember = (id: string) => {
    if (familyMembers.length <= 1) return;
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const handleFamilyMemberChange = (id: string, field: keyof FamilyMemberForm, value: any) => {
    setFamilyMembers(
      familyMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const validateFamilyMembers = (): string | null => {
    if (familyMembers.length === 0) return 'At least one family member is required.';
    
    for (const m of familyMembers) {
      if (!m.name.trim()) return 'All family members must have a valid name.';
      if (m.age < 1 || m.age > 100) return `Member ${m.name} must have an age between 1 and 100.`;
    }

    const primaryCount = familyMembers.filter((m) => m.relationship === 'Primary').length;
    if (primaryCount > 1) return 'Only one Primary Applicant is allowed per Family Floater plan.';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const startTime = Date.now();

    try {
      if (policyType === 'individual') {
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
        const elapsed = Date.now() - startTime;
        if (elapsed < 400) {
          await new Promise((r) => setTimeout(r, 400 - elapsed));
        }

        setResult(res);
        setFamilyResult(null);
        if (onPredictionSuccess) onPredictionSuccess(res);
      } else {
        if (familyMembers.length === 1) {
          const single = familyMembers[0];
          const payload: PredictionInput = {
            age: single.age,
            gender: single.gender,
            smoker: single.smoker,
            region,
            children: 0,
            height_cm: parseFloat(single.heightCm) || 170,
            weight_kg: parseFloat(single.weightKg) || 70,
          };
          const res = await predictPremium(payload);
          setResult(res);
          setFamilyResult(null);
          if (onPredictionSuccess) onPredictionSuccess(res);
          return;
        }

        const valError = validateFamilyMembers();
        if (valError) throw new Error(valError);

        const familyPayload = {
          region,
          members: familyMembers.map((m) => ({
            name: m.name,
            relationship: m.relationship,
            age: m.age,
            gender: m.gender,
            smoker: m.smoker,
            height_cm: parseFloat(m.heightCm) || 170,
            weight_kg: parseFloat(m.weightKg) || 70,
          })),
        };

        const res = await predictFamilyPremium(familyPayload);
        const elapsed = Date.now() - startTime;
        if (elapsed < 400) {
          await new Promise((r) => setTimeout(r, 400 - elapsed));
        }

        setFamilyResult(res);
        setResult(null);
      }
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
    setFamilyResult(null);
    setError(null);
    if (onPredictionSuccess) onPredictionSuccess(null);
  };

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);

  return (
    <section id="prediction-card" className="py-8 bg-white dark:bg-[#09090B] transition-colors">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        
        {/* Render Family Floater Result Card */}
        {familyResult ? (
          <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Family Floater Summary</h3>
              </div>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Estimation
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#18181C] via-[#0F0F12] to-[#18181C] rounded-2xl p-6 text-white text-center space-y-3 border border-zinc-800">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Estimated Family Floater Premium ({familyResult.family_summary.total_members} Members)
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white py-1">
                ₹ {formatINR(familyResult.annual_premium)} <span className="text-lg text-slate-400 font-normal">/ Year</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">
                ₹ {formatINR(familyResult.monthly_premium)} <span className="text-xs text-slate-400 font-normal">/ Month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Covered Members</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{familyResult.family_summary.total_members} Members</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Highest Risk Member</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate block">{familyResult.family_summary.highest_risk_member}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Average Family Score</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{familyResult.family_summary.average_health_score} / 100</span>
              </div>
            </div>

            {/* Individual Member Estimates Table */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Individual Member Premium Breakdown
              </h4>

              <div className="space-y-2 text-xs">
                {familyResult.family_summary.members.map((mem: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181C] border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">{mem.name} ({mem.relationship})</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {mem.age} yrs • {mem.gender} • BMI: {mem.bmi} • {mem.smoker === 'yes' ? 'Smoker' : 'Non-Smoker'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">₹ {formatINR(mem.individual_annual_inr)}</span>
                      <span className="text-[10px] block text-slate-400">Individual Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center pt-2 border-t border-slate-100 dark:border-zinc-800">
              Estimated family floater premium based on individual AI-generated risk assessments. Not an official insurance quotation.
            </p>
          </div>
        ) : result ? (
          /* Render Individual Result Cards */
          <div className="space-y-8">
            <PredictionResult data={result} onReset={handleReset} />
            <HealthRiskGauge score={result.health_snapshot.health_score} riskLevel={result.health_snapshot.risk_level} healthStatus={result.health_snapshot.health_status} />
            <HealthTimeline snapshot={result.health_snapshot} />
            <InfluencerBreakdown snapshot={result.health_snapshot} />
          </div>
        ) : (
          /* Render Form + Landing Page Glossary */
          <div className="space-y-8">
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-zinc-800 shadow-xl relative overflow-hidden transition-colors space-y-8">
              
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-4 border-blue-100 dark:border-zinc-800 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 absolute animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Analyzing profile & calculating rates...</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Running LightGBM ML prediction engine</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 flex items-center gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Title & Policy Type Switcher */}
              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">Health Profile Inputs</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Provide details to compute estimated premium rates</p>
                  </div>
                </div>

                {/* Policy Type Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPolicyType('individual')}
                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      policyType === 'individual'
                        ? 'bg-white dark:bg-[#121215] text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Individual Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicyType('family')}
                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      policyType === 'family'
                        ? 'bg-white dark:bg-[#121215] text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Family Floater Plan
                  </button>
                </div>
              </div>

              {/* FORM BODY */}
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {policyType === 'individual' ? (
                  /* INDIVIDUAL FORM WORKFLOW */
                  <>
                    {/* SECTION 1: Personal Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>1. Personal Information</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label htmlFor="age-input" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#18181C] text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="gender-select" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            Gender
                          </label>
                          <div id="gender-select" className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setGender('female')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                                gender === 'female'
                                  ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                                  : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
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
                                  ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                                  : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                              }`}
                            >
                              {gender === 'male' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                              Male
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Live BMI Calculator with Visual Indicator */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                        <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>2. Live BMI Calculator</span>
                      </div>

                      <div className="space-y-4 bg-slate-50 dark:bg-[#18181C]/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Mode</span>
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

                            {/* Clean Real-Time Visual BMI Indicator (Without Multi-Color Line) */}
                            <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                Instant BMI: <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{derivedBmi}</span>
                              </span>

                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${bmiStyle.badge}`}>
                                <span>{bmiStyle.emoji}</span>
                                <span>{bmiCategory}</span>
                              </span>
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

                    {/* SECTION 3: Lifestyle & Location */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span>3. Lifestyle & Location</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label htmlFor="smoker-status" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            Smoking Status
                          </label>
                          <div id="smoker-status" className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setSmoker('no')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
                                smoker === 'no'
                                  ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                                  : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                              }`}
                            >
                              Non-Smoker
                            </button>
                            <button
                              type="button"
                              onClick={() => setSmoker('yes')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
                                smoker === 'yes'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                                  : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                              }`}
                            >
                              Smoker
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="children-input" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#18181C] text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="region-select" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
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
                                    ? 'bg-blue-50 dark:bg-zinc-800 border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500'
                                    : 'bg-white dark:bg-[#18181C] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                {reg.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* FAMILY FLOATER PLAN WORKFLOW */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Enrolled Family Members ({familyMembers.length})</span>
                      </div>

                      {/* Add Member Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddMember('Child')}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-zinc-700 text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          + Child
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddMember('Parent')}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-zinc-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-zinc-700 text-xs font-bold flex items-center gap-1 hover:bg-purple-100 transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          + Parent
                        </button>
                      </div>
                    </div>

                    {familyMembers.map((m, idx) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-200 dark:border-zinc-800 space-y-4 relative"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={m.name}
                              onChange={(e) => handleFamilyMemberChange(m.id, 'name', e.target.value)}
                              className="font-bold text-xs bg-transparent text-slate-900 dark:text-zinc-100 outline-none border-b border-dashed border-slate-300 dark:border-zinc-600"
                            />
                          </div>

                          {familyMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFamilyMember(m.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">Relationship</label>
                            <select
                              value={m.relationship}
                              onChange={(e) => handleFamilyMemberChange(m.id, 'relationship', e.target.value as any)}
                              className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-slate-900 dark:text-zinc-100 outline-none"
                            >
                              <option value="Primary">Primary Applicant</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Child">Child</option>
                              <option value="Parent">Parent</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">Age</label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={m.age}
                              onChange={(e) => handleFamilyMemberChange(m.id, 'age', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-slate-900 dark:text-zinc-100 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">Gender</label>
                            <select
                              value={m.gender}
                              onChange={(e) => handleFamilyMemberChange(m.id, 'gender', e.target.value as any)}
                              className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-slate-900 dark:text-zinc-100 outline-none"
                            >
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">Smoking Status</label>
                            <select
                              value={m.smoker}
                              onChange={(e) => handleFamilyMemberChange(m.id, 'smoker', e.target.value as any)}
                              className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-slate-900 dark:text-zinc-100 outline-none"
                            >
                              <option value="no">Non-Smoker</option>
                              <option value="yes">Smoker</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{policyType === 'individual' ? 'Predict Individual Premium' : 'Estimate Family Floater Premium'}</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Insurance Glossary renders ONLY on landing page form view */}
            <InsuranceGlossary />
          </div>
        )}

      </div>
    </section>
  );
}
