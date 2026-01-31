
import React, { useState } from 'react';
import { FileMetadata } from '../types';
import Footer from './Footer';
import DocumentPreview from './DocumentPreview';
import { auditInvoiceCompliance } from '../services/geminiService';

interface ComplianceAuditProps {
  files: FileMetadata[];
  addNotification: (notif: any) => void;
}

interface AuditResult {
    globalScore: number;
    riskLevel: 'Faible' | 'Moyen' | 'Critique';
    fiscalCheck: { status: boolean; details: string };
    dataQualityCheck: { status: boolean; details: string };
    gdprCheck: { status: boolean; details: string };
    recommendations: string[];
}

const ComplianceAudit: React.FC<ComplianceAuditProps> = ({ files, addNotification }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const selectedFile = files.find(f => f.id === selectedFileId);
  const availableFiles = files.filter(f => f.status === 'completed');

  const handleRunAudit = async () => {
      if (!selectedFile || !selectedFile.preview) return;

      setIsAnalyzing(true);
      setResult(null);

      try {
        const response = await fetch(selectedFile.preview);
        const blob = await response.blob();
        
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
                const res = reader.result as string;
                resolve(res.split(',')[1] || res);
            };
            reader.readAsDataURL(blob);
        });
        const base64 = await base64Promise;

        const jsonStr = await auditInvoiceCompliance(base64, selectedFile.type);
        const data = JSON.parse(jsonStr) as AuditResult;
        
        setResult(data);
        addNotification({ title: 'Audit Terminé', description: `Score de conformité: ${data.globalScore}/100`, type: 'success' });

      } catch (e) {
          console.error(e);
          addNotification({ title: 'Erreur', description: "Impossible de réaliser l'audit.", type: 'error' });
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="h-full overflow-y-auto w-full custom-scrollbar">
      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-black dark:text-white tracking-tight">Audit <span className="text-blue-600">Conformité IA</span></h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest opacity-60 ml-1">Vérification EU AI Act & Norme EN 16931</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 min-h-[500px]">
            {/* Sidebar selection */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm h-full max-h-[600px] flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Documents Disponibles</h3>
                    {availableFiles.length === 0 ? (
                        <p className="text-xs text-slate-500">Aucun document traité. Veuillez d'abord convertir des factures.</p>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {availableFiles.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => { setSelectedFileId(file.id); setResult(null); }}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                                        selectedFileId === file.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' 
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                                        <DocumentPreview src={file.preview} type={file.type} className="w-full h-full" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold dark:text-white truncate">{file.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{file.summary?.date || 'Date inconnue'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 md:p-12 relative overflow-hidden">
                {!selectedFile ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-xl font-black dark:text-white uppercase tracking-tight">Sélectionnez un document</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">pour lancer l'audit IA</p>
                    </div>
                ) : isAnalyzing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/90 z-20 backdrop-blur-sm">
                        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
                        <h3 className="text-2xl font-black dark:text-white animate-pulse">Audit IA en cours</h3>
                        <div className="flex flex-col gap-2 mt-4 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vérification EN 16931...</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest delay-150">Analyse Data Governance...</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest delay-300">Scan EU AI Act Art. 50...</p>
                        </div>
                    </div>
                ) : !result ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-48 h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 border-4 border-white dark:border-slate-700 shadow-2xl rotate-3 transform transition-transform hover:rotate-0 duration-500 overflow-hidden">
                             <DocumentPreview src={selectedFile.preview} type={selectedFile.type} className="w-full h-full" />
                        </div>
                        <h3 className="text-2xl font-black dark:text-white mb-2">{selectedFile.name}</h3>
                        <p className="text-sm text-slate-500 max-w-md mb-8">Ce document sera analysé par notre modèle Gemini Pro configuré pour la régulation européenne.</p>
                        <button 
                            onClick={handleRunAudit}
                            className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all"
                        >
                            Lancer l'Audit de Conformité
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10 border-b border-slate-100 dark:border-slate-800 pb-8">
                             <div>
                                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                     Audit Certifié par IA
                                 </div>
                                 <h3 className="text-3xl font-black dark:text-white mb-1">Rapport de Conformité</h3>
                                 <p className="text-xs font-bold text-slate-400">Réf: {selectedFile.id.split('-')[1]}</p>
                             </div>
                             
                             <div className="flex items-center gap-6">
                                 <div className="text-right">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Niveau de Risque</p>
                                     <p className={`text-xl font-black ${
                                         result.riskLevel === 'Faible' ? 'text-green-500' :
                                         result.riskLevel === 'Moyen' ? 'text-amber-500' : 'text-red-500'
                                     }`}>{result.riskLevel.toUpperCase()}</p>
                                 </div>
                                 <div className="w-px h-12 bg-slate-100 dark:border-slate-800"></div>
                                 <div className="text-right">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score Global</p>
                                     <p className="text-4xl font-black text-blue-600">{result.globalScore}/100</p>
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {/* Card 1 */}
                            <div className={`p-6 rounded-3xl border-2 ${result.fiscalCheck.status ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-100'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.fiscalCheck.status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">Fiscalité EN 16931</h4>
                                </div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{result.fiscalCheck.details}</p>
                            </div>

                            {/* Card 2 */}
                            <div className={`p-6 rounded-3xl border-2 ${result.dataQualityCheck.status ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-amber-50/50 border-amber-100'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.dataQualityCheck.status ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                    </div>
                                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">Qualité Données</h4>
                                </div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{result.dataQualityCheck.details}</p>
                            </div>

                            {/* Card 3 */}
                            <div className={`p-6 rounded-3xl border-2 ${result.gdprCheck.status ? 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30' : 'bg-red-50/50 border-red-100'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.gdprCheck.status ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">RGPD & Privacy</h4>
                                </div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{result.gdprCheck.details}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
                             <h4 className="font-black text-sm uppercase tracking-widest text-slate-700 dark:text-white mb-6">Recommandations de l'IA</h4>
                             <ul className="space-y-4">
                                 {result.recommendations.map((rec, idx) => (
                                     <li key={idx} className="flex gap-4 items-start">
                                         <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">{idx + 1}</span>
                                         <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{rec}</p>
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default ComplianceAudit;
