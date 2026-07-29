'use client';

import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw, Activity, CheckCircle, Circle, Milestone, Scale, Sparkles, Info, ChevronRight } from 'lucide-react';

interface FamilyDashboardProps {
  familyResult: any;
  onReset: () => void;
}

export default function FamilyDashboard({ familyResult, onReset }: FamilyDashboardProps) {
  const summary = familyResult.family_summary;
  const members = summary.members || [];
  const influenceInsights = summary.influence_insights || [];
  
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(summary.average_health_score);
    }, 150);
    return () => clearTimeout(timer);
  }, [summary.average_health_score]);

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);

  // Score Gauge SVG Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const scoreDashoffset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return { stroke: '#10B981', text: 'text-emerald-600 dark:text-emerald-400', label: 'Healthy' };
    if (sc >= 60) return { stroke: '#F59E0B', text: 'text-amber-600 dark:text-amber-400', label: 'Moderate' };
    return { stroke: '#EF4444', text: 'text-rose-600 dark:text-rose-400', label: 'High Risk' };
  };

  const getRiskGaugeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return { stroke: '#10B981', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: '🟢' };
      case 'moderate':
        return { stroke: '#F59E0B', badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: '🟡' };
      case 'high':
        return { stroke: '#EF4444', badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800', dot: '🔴' };
      default:
        return { stroke: '#3B82F6', badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', dot: '🔵' };
    }
  };

  const scoreStyle = getScoreColor(summary.average_health_score);
  const riskStyle = getRiskGaugeColor(summary.overall_family_risk);

  const getBmiBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'healthy':
        return { dot: '🟢', text: 'Healthy', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'overweight':
        return { dot: '🟡', text: 'Overweight', badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'obese':
        return { dot: '🔴', text: 'Obese', badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
      default:
        return { dot: '🔴', text: 'Underweight', badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
    }
  };

  const subtotal = familyResult.subtotal_annual_premium || familyResult.annual_premium;
  const discountAmount = familyResult.discount_amount || 0;
  const discountPct = familyResult.discount_percentage || 0;

  // Milestones Data
  const milestones = [
    {
      title: 'Family Non-Smoker Ratio',
      achieved: summary.num_smokers === 0,
      achievedLabel: '✅ Non-Smoker Family Unit',
      pendingLabel: '○ Tobacco Cessation Plan Needed',
      desc: summary.num_smokers === 0 ? '100% tobacco-free family members protecting health and rates.' : `${summary.num_smokers} member(s) smoke. Quitting improves family rates.`,
    },
    {
      title: 'Healthy BMI Ratio',
      achieved: summary.num_healthy >= Math.ceil(summary.total_members / 2),
      achievedLabel: '✅ Healthy Family BMI Balance',
      pendingLabel: '○ Improve Family Weight Balance',
      desc: `${summary.num_healthy} out of ${summary.total_members} members are in the ideal BMI category.`,
    },
    {
      title: 'Regular Exercise Goal',
      achieved: summary.average_health_score >= 75,
      achievedLabel: '✅ Family Wellness Goal',
      pendingLabel: '○ Increase Active Daily Hours',
      desc: 'Active routines support long-term cardiovascular health across all age tiers.',
    },
    {
      title: 'Annual Health Checkup',
      achieved: true,
      achievedLabel: '✅ Annual Checkup Protection Plan',
      pendingLabel: '○ Schedule Checkup',
      desc: 'Includes free annual health checkups for enrolled adult family members.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header & Estimated Family Premium Card */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-lg">Family Floater Prediction Dashboard</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Independent adult risk predictions + floater discount</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Estimation
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#18181C] via-[#0F0F12] to-[#18181C] rounded-2xl p-6 text-white text-center space-y-3 border border-zinc-800">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
            Final Family Floater Premium ({summary.total_members} Insured Members)
          </span>
          <div className="text-4xl sm:text-5xl font-black text-white py-1">
            ₹ {formatINR(familyResult.annual_premium)} <span className="text-lg text-slate-400 font-normal">/ Year</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">
            ₹ {formatINR(familyResult.monthly_premium)} <span className="text-xs text-slate-400 font-normal">/ Month</span>
          </div>
        </div>

        {/* Transparent Premium Calculation Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Transparent Premium Calculation Breakdown
          </h4>

          <div className="space-y-2">
            {members.map((m: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-zinc-300">
                <span>{m.name} ({m.relationship}){m.is_child ? ' • Child Rate' : ''}</span>
                <span className="font-semibold">₹ {formatINR(m.individual_annual_inr)} / year</span>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between font-bold text-slate-800 dark:text-zinc-200">
              <span>Subtotal (Sum of Individual Premiums)</span>
              <span>₹ {formatINR(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>Family Floater Multi-Policy Discount ({discountPct}%)</span>
                <span>− ₹ {formatINR(discountAmount)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-zinc-100">
              <span>Final Family Floater Premium</span>
              <span className="text-emerald-600 dark:text-emerald-400">₹ {formatINR(familyResult.annual_premium)} / year</span>
            </div>
          </div>
        </div>

        {/* 2. Family Health Snapshot Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 space-y-1">
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px] font-medium">Total Members</span>
            <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-base">{summary.total_members} Members</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 space-y-1">
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px] font-medium">Average Age</span>
            <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-base">{summary.average_age} Yrs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 space-y-1">
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px] font-medium">Average BMI</span>
            <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-base">{summary.average_bmi}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-100 dark:border-zinc-800 space-y-1">
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px] font-medium">Smokers / Healthy</span>
            <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-base">{summary.num_smokers} / {summary.num_healthy}</span>
          </div>
        </div>
      </div>

      {/* Premium Influence Insights */}
      {influenceInsights.length > 0 && (
        <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Key Premium Influence Factors
          </h4>
          <div className="space-y-2 text-xs">
            {influenceInsights.map((insight: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Overall Family Score & Family Risk Circular Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Overall Family Health Score Gauge */}
        <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4 flex flex-col items-center justify-center text-center">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Overall Family Health Score
          </h4>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} className="text-slate-100 dark:text-zinc-800" strokeWidth="10" stroke="currentColor" fill="transparent" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={scoreStyle.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={scoreDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-zinc-100">{animatedScore}</span>
              <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${scoreStyle.text}`}>
            Status: {scoreStyle.label}
          </span>
        </div>

        {/* Family Health Risk Gauge */}
        <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4 flex flex-col items-center justify-center text-center">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Family Health Risk Gauge
          </h4>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} className="text-slate-100 dark:text-zinc-800" strokeWidth="10" stroke="currentColor" fill="transparent" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={riskStyle.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (summary.overall_family_risk === 'Low' ? 0.85 : summary.overall_family_risk === 'Moderate' ? 0.6 : 0.3) * circumference}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center space-y-0.5">
              <span className="text-2xl">{riskStyle.dot}</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{summary.overall_family_risk} Risk</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Highest Risk Member: <strong className="text-slate-800 dark:text-zinc-200">{summary.highest_risk_member}</strong>
          </p>
        </div>

      </div>

      {/* 4. Per-Member BMI & Rate Analysis */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Per-Member BMI & Rate Analysis</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Individual risk breakdown per insured person</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((mem: any, idx: number) => {
            const bmiStyle = getBmiBadge(mem.bmi_status);
            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181C] border border-slate-200/80 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{mem.name}</h5>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">{mem.relationship} • {mem.age} yrs • {mem.gender}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${bmiStyle.badge}`}>
                    <span>{bmiStyle.dot}</span>
                    <span>{mem.bmi_status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">BMI Value</span>
                    <span className="font-extrabold text-slate-800 dark:text-zinc-200">{mem.bmi}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Smoking</span>
                    <span className="font-extrabold text-slate-800 dark:text-zinc-200">{mem.smoker === 'yes' ? 'Smoker' : 'Non-Smoker'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Individual Rate</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">₹{formatINR(mem.individual_annual_inr)}</span>
                  </div>
                </div>

                {mem.wellness_suggestions && mem.wellness_suggestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/40 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1">
                    <span className="font-semibold text-[10px] text-slate-400 uppercase">Wellness Suggestion</span>
                    <p className="line-clamp-2">{mem.wellness_suggestions[0]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Family Health Milestones */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Milestone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Family Health Milestones</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Track completed and pending health targets</p>
          </div>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs transition-all ${
                m.achieved
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700'
              }`}
            >
              {m.achieved ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              )}

              <div className="space-y-1">
                <span className={`font-bold ${m.achieved ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-500 dark:text-zinc-400'}`}>
                  {m.achieved ? m.achievedLabel : m.pendingLabel}
                </span>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
