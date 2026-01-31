
import React from 'react';

interface DocumentPreviewProps {
  src?: string;
  type: string;
  className?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ src, type, className = "" }) => {
  const isPdf = type === 'application/pdf';

  if (!src) {
     return (
        <div className={`w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 ${className}`}>
           <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           <span className="text-[8px] font-black uppercase tracking-widest">PDF</span>
        </div>
     );
  }

  return (
    <div className={`w-full h-full overflow-hidden relative ${className}`}>
      {isPdf ? (
         <div className="w-full h-full bg-white dark:bg-slate-950 p-2 flex flex-col gap-2 filter blur-[2px] opacity-80 scale-110 select-none pointer-events-none transform origin-top-left">
            <div className="flex justify-between items-center mb-1">
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="w-10 h-2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="w-5/6 h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="w-3/4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="mt-auto w-12 h-2 bg-blue-200 dark:bg-blue-900/50 rounded self-end"></div>
         </div>
      ) : (
        <img src={src} className="w-full h-full object-cover blur-[3px] scale-110" alt="Preview" />
      )}
    </div>
  );
};

export default DocumentPreview;
