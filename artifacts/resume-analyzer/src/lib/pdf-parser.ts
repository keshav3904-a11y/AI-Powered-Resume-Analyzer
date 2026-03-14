import * as pdfjsLib from 'pdfjs-dist';

// Use Vite's new URL() pattern — Vite resolves this at build time to the correct
// installed version of the worker, so version mismatches are impossible.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => typeof item.str === 'string')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  if (!fullText.trim()) {
    throw new Error(
      'No text could be extracted from this PDF. It may be a scanned image-only document.'
    );
  }

  return fullText;
};
