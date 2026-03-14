import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyze } from '@/hooks/use-resume';
import { useAppStore } from '@/store/use-app-store';

export default function Analyze() {
  const [, setLocation] = useLocation();
  const {
    resumeText,
    selectedJobRole,
    customSkills,
    customRoleTitle,
    setAnalysisResult,
  } = useAppStore();
  const { mutate, isPending, error, data } = useAnalyze();

  useEffect(() => {
    if (!resumeText || !selectedJobRole) {
      setLocation('/upload');
    }
  }, [resumeText, selectedJobRole, setLocation]);

  useEffect(() => {
    if (data) {
      setAnalysisResult(data);
      const timer = setTimeout(() => setLocation('/results'), 500);
      return () => clearTimeout(timer);
    }
  }, [data, setAnalysisResult, setLocation]);

  const handleAnalyze = () => {
    const payload: Parameters<typeof mutate>[0]['data'] =
      selectedJobRole === '__custom__'
        ? {
            resumeText,
            jobRole: '__custom__',
            customSkills,
            customRoleTitle: customRoleTitle || 'Custom Role',
          }
        : { resumeText, jobRole: selectedJobRole };

    mutate({ data: payload });
  };

  if (!resumeText || !selectedJobRole) return null;

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/40">
            {isPending ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <Zap className="w-10 h-10" />
            )}
          </div>
        </div>

        <h2 className="text-4xl font-bold text-slate-900 mb-4">
          {isPending ? 'Analyzing your Resume...' : 'Ready for Analysis'}
        </h2>

        <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto">
          {isPending
            ? 'Our AI is extracting skills, calculating matching scores, and generating actionable insights. This usually takes a few seconds.'
            : 'We have your resume text and target role. Click the button below to initiate the deep learning NLP analysis.'}
        </p>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 max-w-md mx-auto text-sm">
            {(error as any).message || 'An error occurred during analysis. Please try again.'}
          </div>
        )}

        {!isPending && !data && (
          <Button size="lg" onClick={handleAnalyze} className="w-64 text-lg">
            Start Analysis
          </Button>
        )}
      </motion.div>
    </div>
  );
}
