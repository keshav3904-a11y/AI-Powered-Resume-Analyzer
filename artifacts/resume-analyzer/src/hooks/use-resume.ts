import { useAnalyzeResume, useGetJobRoles } from '@workspace/api-client-react';

export function useJobRoles() {
  return useGetJobRoles();
}

export function useAnalyze() {
  return useAnalyzeResume();
}
