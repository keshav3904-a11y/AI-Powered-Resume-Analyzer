import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Download, AlertCircle, TrendingUp, Briefcase, GraduationCap, Code, Sparkles } from 'lucide-react';
import { 
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/use-app-store';

export default function Results() {
  const [, setLocation] = useLocation();
  const { analysisResult } = useAppStore();

  if (!analysisResult) {
    return (
      <div className="p-12 text-center h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
        <p className="text-slate-500 mb-8">Please complete the analysis step first.</p>
        <Button onClick={() => setLocation('/')}>Start Over</Button>
      </div>
    );
  }

  const {
    overallScore, skillScore, experienceScore, educationScore, projectScore,
    matchedSkills, missingSkills, resumeSummary, strengthAreas, improvementTips,
    skillRecommendations, explainability, skillCoveragePercent,
    candidateName, email, experience
  } = analysisResult;

  const scoreData = [{ name: 'Score', value: overallScore, fill: overallScore > 75 ? '#22c55e' : overallScore > 50 ? '#eab308' : '#ef4444' }];
  
  const pieData = [
    { name: 'Matched', value: skillCoveragePercent, color: '#3b82f6' },
    { name: 'Missing', value: 100 - skillCoveragePercent, color: '#cbd5e1' }
  ];

  const barData = [
    { name: 'Skills', score: skillScore },
    { name: 'Experience', score: experienceScore },
    { name: 'Education', score: educationScore },
    { name: 'Projects', score: projectScore },
  ];

  const handleDownload = () => {
    const report = `
AI RESUME ANALYSIS REPORT
-------------------------
Candidate: ${candidateName || 'Unknown'}
Email: ${email || 'N/A'}
Experience Evaluated: ${experience || 'N/A'}

OVERALL MATCH SCORE: ${overallScore}%
-------------------------
Breakdown:
- Skills (50%): ${skillScore}%
- Experience (25%): ${experienceScore}%
- Education (15%): ${educationScore}%
- Projects (10%): ${projectScore}%

SUMMARY:
${resumeSummary}

STRENGTHS:
${strengthAreas.map(s => `- ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${improvementTips.map(t => `- ${t}`).join('\n')}

SKILL RECOMMENDATIONS:
${skillRecommendations.map(r => `- ${r}`).join('\n')}

MATCHED SKILLS: ${matchedSkills.join(', ')}
MISSING SKILLS: ${missingSkills.join(', ')}

EXPLAINABILITY (AI Reasoning):
${explainability}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_Analysis_${candidateName?.replace(/\s+/g, '_') || 'Report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 pb-20 max-w-6xl mx-auto min-h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Analysis Dashboard</h1>
          <p className="text-slate-500">Comprehensive breakdown of your resume match.</p>
        </div>
        <Button onClick={handleDownload} variant="outline" className="gap-2 bg-white">
          <Download size={18} />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Overall Score */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="font-semibold text-slate-700 mb-2">Overall Match Score</h3>
          <div className="h-48 w-48 -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="70%" outerRadius="100%" 
                barSize={20} data={scoreData} 
                startAngle={180} endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background clockWise dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-4">
              <span className="text-4xl font-black text-slate-900">{overallScore}<span className="text-xl text-slate-400">%</span></span>
            </div>
          </div>
          <p className="text-sm text-slate-500 px-4">
            {overallScore >= 80 ? 'Excellent match for this role!' : overallScore >= 60 ? 'Good potential, needs some tweaks.' : 'Consider upskilling for this role.'}
          </p>
        </Card>

        {/* Score Breakdown Bar Chart */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Category Breakdown</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Skills Assessment */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Skills Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Matched Skills</h4>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.length > 0 ? matchedSkills.map(skill => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                )) : <p className="text-sm text-slate-500 italic">No exact skill matches found.</p>}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Missing Skills (To Learn)</h4>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length > 0 ? missingSkills.map(skill => (
                  <Badge key={skill} variant="destructive">{skill}</Badge>
                )) : <p className="text-sm text-slate-500 italic">You have all the required skills!</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Pie */}
        <Card className="flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Skill Coverage</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-2">
                <span className="text-3xl font-bold text-slate-900">{skillCoveragePercent}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="text-green-500 w-5 h-5" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengthAreas.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="text-amber-500 w-5 h-5" /> Improvement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {improvementTips.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
             </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-accent w-6 h-6" /> AI Explainability Summary
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {explainability || resumeSummary}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
