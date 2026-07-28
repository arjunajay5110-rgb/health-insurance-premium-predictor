'use client';

import React, { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { searchGlossaryTerm } from '@/lib/api';

interface TermItem {
  term: string;
  definition: string;
  source?: string;
}

const LOCAL_GLOSSARY: TermItem[] = [
  { term: 'Premium', definition: 'The recurring amount you pay to an insurance company (monthly or annually) to keep your health insurance policy active.' },
  { term: 'Deductible', definition: 'The fixed amount you must pay out-of-pocket for medical expenses before your insurance company begins covering expenses.' },
  { term: 'Co-payment', definition: 'A cost-sharing clause where you pay a fixed percentage (e.g. 10% or 20%) of each claim, and the insurer pays the remaining percentage.' },
  { term: 'Waiting Period', definition: 'The specified period during which policyholders cannot claim benefits for pre-existing conditions or specific procedures.' },
  { term: 'Cashless Hospitalization', definition: 'A facility where covered medical treatment expenses at network hospitals are settled directly by the insurer without upfront cash payment.' },
  { term: 'Network Hospital', definition: 'Hospitals partnered with an insurance provider to offer direct cashless hospitalization to policyholders.' },
  { term: 'Sum Insured', definition: 'The maximum annual financial coverage limit an insurance company will pay for your medical expenses during policy term.' },
  { term: 'Rider', definition: 'An optional add-on cover (e.g. critical illness, maternity, personal accident) purchased to enhance base policy protection.' },
  { term: 'Exclusions', definition: 'Specific medical conditions, treatments, or scenarios explicitly listed as not covered under the insurance policy contract.' },
  { term: 'Grace Period', definition: 'The extra window (usually 15-30 days) granted after policy due date to pay renewal premiums without losing policy continuity benefits.' },
  { term: 'Claim Settlement', definition: 'The formal procedure by which an insurer reviews, approves, and disburses payment for valid hospital bills.' },
  { term: 'No Claim Bonus (NCB)', definition: 'A reward offered as an increased Sum Insured or premium discount for every policy year with zero claims.' },
  { term: 'Family Floater', definition: 'A policy where a single shared Sum Insured covers all enrolled family members under one single premium.' },
  { term: 'Individual Policy', definition: 'An insurance policy providing dedicated, unshared Sum Insured coverage exclusively for a single individual.' },
  { term: 'Pre-existing Disease (PED)', definition: 'Any illness, injury, or medical condition diagnosed before buying the health insurance policy.' },
  { term: 'Preventive Health Checkup', definition: 'Free annual health checkup coupons or benefits provided by insurers to encourage early detection and wellness.' },
  { term: 'Renewal', definition: 'Extending policy coverage for an additional policy term by paying the required renewal premium.' },
  { term: 'Policy Period', definition: 'The specific timeframe (usually 1 or 2 years) during which insurance coverage remains legally active.' },
];

// In-memory session cache for Gemini search results
const searchCache: Record<string, TermItem> = {};

export default function InsuranceGlossary() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<TermItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Local matching items
  const localMatches = LOCAL_GLOSSARY.filter((item) =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (term: string) => {
    setExpandedTerm(expandedTerm === term ? null : term);
  };

  const handleAiSearch = async () => {
    const query = searchTerm.trim();
    if (!query || loading) return;

    // Check session cache first
    const cacheKey = query.toLowerCase();
    if (searchCache[cacheKey]) {
      const cached = searchCache[cacheKey];
      setAiResults((prev) => [cached, ...prev.filter((x) => x.term !== cached.term)]);
      setExpandedTerm(cached.term);
      return;
    }

    setLoading(true);
    try {
      const res = await searchGlossaryTerm(query);
      const newItem: TermItem = {
        term: query,
        definition: res.definition,
        source: res.source || 'Gemini AI',
      };
      
      // Cache in session
      searchCache[cacheKey] = newItem;

      setAiResults((prev) => [newItem, ...prev.filter((x) => x.term !== newItem.term)]);
      setExpandedTerm(newItem.term);
    } catch (err) {
      console.error('Gemini glossary search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine local matches + AI generated search results
  const allItems = [...aiResults, ...localMatches];
  const uniqueItems = Array.from(new Map(allItems.map((item) => [item.term.toLowerCase(), item])).values());

  return (
    <section className="py-8 bg-slate-50/60 dark:bg-[#09090B] border-t border-slate-200/60 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">Insurance Glossary</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Search and learn key health insurance terminology</p>
            </div>
          </div>

          {/* Smart Search Box with Gemini Integration */}
          <div className="flex gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && localMatches.length === 0) {
                    handleAiSearch();
                  }
                }}
                placeholder="Search terms or ask AI..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121215] text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {searchTerm && localMatches.length === 0 && (
              <button
                type="button"
                onClick={handleAiSearch}
                disabled={loading}
                className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Ask AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-zinc-800/80 border border-blue-100 dark:border-zinc-700 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Consulting Gemini AI Insurance Knowledge Base...</span>
          </div>
        )}

        {/* Glossary Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {uniqueItems.map((item) => {
            const isExpanded = expandedTerm === item.term;
            return (
              <div
                key={item.term}
                onClick={() => toggleExpand(item.term)}
                className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-2xs hover:border-blue-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.source ? 'bg-amber-500' : 'bg-blue-600'}`} />
                    {item.term}
                    {item.source && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                        {item.source}
                      </span>
                    )}
                  </h3>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>

                <p className={`text-xs text-slate-600 dark:text-zinc-400 leading-relaxed transition-all ${isExpanded ? 'block' : 'line-clamp-2'}`}>
                  {item.definition}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
