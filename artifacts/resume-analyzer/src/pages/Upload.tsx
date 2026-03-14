import React, { useCallback, useState } from 'react';
import { useLocation } from 'wouter';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, File, FileCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { useAppStore } from '@/store/use-app-store';

export default function Upload() {
  const [, setLocation] = useLocation();
  const { uploadedFile, setUploadedFile, setResumeText } = useAppStore();
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setUploadedFile(file);
    setIsExtracting(true);

    try {
      const text = await extractTextFromPDF(file);
      if (!text || text.trim().length < 50) {
        throw new Error('Could not extract enough text. Ensure the PDF is not an image-only scan.');
      }
      setResumeText(text);
      setTimeout(() => {
        setLocation('/role');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during extraction.');
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, [setUploadedFile, setResumeText, setLocation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto min-h-full flex flex-col justify-center">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload your Resume</h2>
        <p className="text-slate-500 mb-8">We accept PDF format. Our AI will automatically extract the text to evaluate your profile.</p>

        <Card className="overflow-hidden border-2 border-dashed border-slate-200">
          <div
            {...getRootProps()}
            className={`p-16 text-center cursor-pointer transition-colors duration-300 ${
              isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-slate-50'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center gap-4">
              {isExtracting ? (
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              ) : uploadedFile ? (
                <FileCheck className="w-16 h-16 text-green-500" />
              ) : (
                <UploadCloud className={`w-16 h-16 ${isDragActive ? 'text-primary' : 'text-slate-400'}`} />
              )}

              <div className="space-y-2">
                {isExtracting ? (
                  <>
                    <h3 className="text-xl font-semibold text-slate-900">Extracting Text...</h3>
                    <p className="text-slate-500">Please wait while we read your document.</p>
                  </>
                ) : uploadedFile ? (
                  <>
                    <h3 className="text-xl font-semibold text-green-600">Upload Successful!</h3>
                    <p className="text-slate-600 font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-400">Redirecting to next step...</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Drag & Drop your PDF here
                    </h3>
                    <p className="text-slate-500">or click to browse files</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-700 font-medium text-sm border border-red-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <div className="mt-10 flex justify-between items-center">
          <Button variant="ghost" onClick={() => setLocation('/')}>Back to Home</Button>
          <Button 
            disabled={!uploadedFile || isExtracting} 
            onClick={() => setLocation('/role')}
            className="w-40"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
