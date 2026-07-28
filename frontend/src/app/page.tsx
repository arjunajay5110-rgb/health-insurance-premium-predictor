'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PredictionForm from '@/components/PredictionForm';
import HealthTipsCarousel from '@/components/HealthTipsCarousel';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import FloatingAiAdvisor from '@/components/FloatingAiAdvisor';
import { PredictionResultData } from '@/types';

export default function Home() {
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResultData | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090B] text-slate-900 dark:text-zinc-100 font-sans transition-colors">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HealthTipsCarousel />
        <PredictionForm onPredictionSuccess={setCurrentPrediction} />
        <AboutSection />
      </main>
      <Footer />
      
      {/* Floating AI Insurance Advisor Fixed Button & Panel */}
      <FloatingAiAdvisor predictionContext={currentPrediction} />
    </div>
  );
}
