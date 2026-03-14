import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Sparkles, PieChart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';

const features = [
  { icon: FileText, title: '1. Upload Resume', desc: 'Securely upload your PDF resume for instant text extraction.' },
  { icon: Briefcase, title: '2. Select Role', desc: 'Choose the target job role you want to match against.' },
  { icon: Sparkles, title: '3. AI Analysis', desc: 'Advanced NLP evaluates your skills, experience, and education.' },
  { icon: PieChart, title: '4. View Results', desc: 'Get a comprehensive dashboard with scores and actionable tips.' },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const reset = useAppStore(state => state.reset);

  const handleStart = () => {
    reset();
    setLocation('/upload');
  };

  return (
    <div className="min-h-full flex flex-col relative">
      {/* Background with image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-[0.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-8 md:p-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-slate-700">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Optimize Your Resume for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Perfect Job</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get instant, AI-driven feedback on your resume. We analyze your skills, experience, and education against industry standards to help you land your dream job.
          </p>

          <Button size="lg" onClick={handleStart} className="gap-2 group">
            Start Free Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-24 w-full max-w-5xl"
        >
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl shadow-slate-200/40 text-left hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
