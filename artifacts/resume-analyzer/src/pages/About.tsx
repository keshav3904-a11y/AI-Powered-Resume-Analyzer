import React from 'react';
import { motion } from 'framer-motion';
import { Code2, School, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto min-h-full flex flex-col justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">About the Project</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          An advanced NLP-powered tool designed to bridge the gap between resumes and job requirements using modern AI techniques.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardContent className="p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Developers</h3>
            <ul className="space-y-4 mt-6">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                  KV
                </div>
                <span className="font-medium text-slate-800">Kevalram Vaishnav</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                  KA
                </div>
                <span className="font-medium text-slate-800">Keshav Agarwal</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-accent shadow-xl">
          <CardContent className="p-8">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
              <School className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Institution</h3>
            
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">College</p>
                <p className="font-semibold text-slate-800">Jodhpur Institute of Engineering and Technology</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Department</p>
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-400" />
                  CSE (AI & ML)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
