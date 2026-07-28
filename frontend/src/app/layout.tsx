import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI Health Insurance Premium Predictor | AegisHealth ML',
  description: 'Estimate your annual health insurance premium using a LightGBM machine learning regression model trained on medical cost datasets.',
  keywords: ['health insurance predictor', 'machine learning insurance rate', 'LightGBM premium prediction', 'medical charges estimator'],
  authors: [{ name: 'AegisHealth Engineering' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased bg-white dark:bg-[#09090B] text-slate-900 dark:text-zinc-100 transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
