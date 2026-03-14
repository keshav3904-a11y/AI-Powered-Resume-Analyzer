import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Upload, Briefcase, Activity, PieChart, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/use-app-store';

const steps = [
  { id: 'home', path: '/', label: 'Home', icon: Home, num: 1 },
  { id: 'upload', path: '/upload', label: 'Upload Resume', icon: Upload, num: 2 },
  { id: 'role', path: '/role', label: 'Job Role', icon: Briefcase, num: 3 },
  { id: 'analyze', path: '/analyze', label: 'Analysis', icon: Activity, num: 4 },
  { id: 'results', path: '/results', label: 'Results', icon: PieChart, num: 5 },
  { id: 'about', path: '/about', label: 'About', icon: Info, num: 6 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { uploadedFile, selectedJobRole, analysisResult } = useAppStore();

  const getStatus = (id: string) => {
    if (id === 'upload' && uploadedFile) return true;
    if (id === 'role' && selectedJobRole) return true;
    if (id === 'analyze' && analysisResult) return true;
    if (id === 'results' && analysisResult) return true;
    return false;
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col shadow-xl shadow-slate-200/20 relative z-10">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 text-white font-bold text-xl">
            A
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            AI Resume <br/><span className="text-primary">Analyzer</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {steps.map((step) => {
          const isActive = location === step.path;
          const isCompleted = getStatus(step.id);
          const Icon = step.icon;

          return (
            <Link
              key={step.id}
              href={step.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors",
                isActive ? "bg-white shadow-sm text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm"
              )}>
                <Icon size={16} strokeWidth={2.5} />
              </div>
              
              <span className="flex-1">{step.label}</span>

              {isCompleted && (
                <CheckCircle2 size={18} className="text-green-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
