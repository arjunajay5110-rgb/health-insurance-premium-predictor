import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PredictionForm from '@/components/PredictionForm';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <PredictionForm />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
