import { create } from 'zustand';
import type { AnalyzeResumeResponse } from '@workspace/api-client-react';

interface AppState {
  uploadedFile: File | null;
  resumeText: string;
  selectedJobRole: string;
  customSkills: string[];
  customRoleTitle: string;
  analysisResult: AnalyzeResumeResponse | null;

  setUploadedFile: (file: File | null) => void;
  setResumeText: (text: string) => void;
  setSelectedJobRole: (roleId: string) => void;
  setCustomSkills: (skills: string[]) => void;
  setCustomRoleTitle: (title: string) => void;
  setAnalysisResult: (result: AnalyzeResumeResponse | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  uploadedFile: null,
  resumeText: '',
  selectedJobRole: '',
  customSkills: [],
  customRoleTitle: '',
  analysisResult: null,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setResumeText: (text) => set({ resumeText: text }),
  setSelectedJobRole: (roleId) => set({ selectedJobRole: roleId }),
  setCustomSkills: (skills) => set({ customSkills: skills }),
  setCustomRoleTitle: (title) => set({ customRoleTitle: title }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  reset: () =>
    set({
      uploadedFile: null,
      resumeText: '',
      selectedJobRole: '',
      customSkills: [],
      customRoleTitle: '',
      analysisResult: null,
    }),
}));
