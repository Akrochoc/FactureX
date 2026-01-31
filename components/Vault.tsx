
import React, { useState } from 'react';
import { FileMetadata, InvoiceStatus } from '../types';
import Footer from './Footer';
import DocumentPreview from './DocumentPreview';

interface VaultProps {
  invoices: FileMetadata[];
  onOpenReport: (invoice: FileMetadata) => void;
}

const Vault: React.FC<VaultProps> = ({ invoices, onOpenReport }) => {
  // Added 'critical' to the filter type
  const [filter, setFilter] = useState<InvoiceStatus | 'all' | 'critical'>('all');
  
  const completedInvoices = invoices.filter(i => i.status === 'completed');
  
  // Updated filtering logic to handle 'critical' (compliance < 60)
  const filteredInvoices = filter === 'all' 
    ? completedInvoices 
    : filter === 'critical'
      ? completedInvoices.filter(i => (i.summary?.compliance || 100) < 60)
      : completedInvoices.filter(i => i.summary?.paymentStatus === filter);

  const statusLabels: Record<InvoiceStatus | 'all' | 'critical', string> = {
    all: 'Tous les flux',
    critical: 'Anomalies', // New Label
    draft: 'Brouillon',
    to_validate: 'À Valider',
    validated: 'Validé',
    paid: 'Payé'
  };

  // Define order of buttons
  const filterKeys: (InvoiceStatus | 'all' | 'critical')[] = ['all', 'critical', 'draft', 'to_validate', 'validated', 'paid'];

  return (
    <div className="h-full overflow-y-auto w-full custom-scrollbar">
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black dark:text-white tracking-tight">Archives <span className="text-blue-600">Scellées</span></h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 opacity-60">Conservation légale 10 ans • Coffre-fort numérique</p>
          </div>
          <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-inner">
            {filterKeys.map(s => {
              const isCriticalBtn = s === 'critical';
              const isActive = filter === s;
              
              let btnClass = "";
              if (isActive) {
                btnClass = isCriticalBtn 
                  ? "bg-red-600 text-white shadow-xl shadow-red-500/30" 
                  : "bg-white dark:bg-slate-800 text-blue-600 shadow-xl";
              } else {
                btnClass = isCriticalBtn
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-slate-400 hover:text-slate-600";
              }

              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${btnClass}`}
                >
                  {isCriticalBtn && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {statusLabels[s]}
                </button>
              );
            })}
          </div>
        </header>

        {filteredInvoices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-16 md:p-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100 opacity-40">
               {filter === 'critical' ? (
                 <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               ) : (
                 <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               )}
            </div>
            <p className="text-2xl font-black dark:text-white uppercase tracking-tight">
                {filter === 'critical' ? 'Aucune anomalie détectée' : 'Aucun document archivé'}
            </p>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2 opacity-60">
                {filter === 'critical' ? 'Vos archives sont parfaitement conformes.' : 'Lancez une conversion pour sceller votre premier document.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {filteredInvoices.map((invoice) => {
              const summary = invoice.summary!;
              const isDanger = summary.compliance < 60; // Use compliance score directly as trigger for critical alert
              const complianceBg = summary.compliance > 90 ? 'bg-green-500' : summary.compliance > 70 ? 'bg-amber-500' : 'bg-red-500';
              const complianceText = summary.compliance > 90 ? 'text-green-600' : summary.compliance > 70 ? 'text-amber-600' : 'text-red-600';

              return (
                <div 
                  key={invoice.id}
                  onClick={() => onOpenReport(invoice)}
                  className={`group relative bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2 flex flex-col ${
                    isDanger 
                      ? 'border-4 border-red-500 shadow-red-500/10' // Cadre rouge pour critique
                      : 'border-2 border-slate-50 dark:border-slate-800 shadow-lg' // Rien (bordure subtile) pour les autres
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6">
                    {/* Responsive Image Container */}
                    <div className="relative w-full sm:w-32 aspect-[3/4] sm:aspect-[3/4] bg-slate-100 dark:bg-slate-950 rounded-[1.8rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl transform group-hover:rotate-2 transition-transform duration-500">
                      <DocumentPreview src={invoice.preview} type={invoice.type} className="w-full h-full scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                      {/* Status Tag: Adjusted colors */}
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                        summary.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                        summary.paymentStatus === 'validated' ? 'bg-blue-100 text-blue-700 border-blue-200' : // Validé en bleu
                        summary.paymentStatus === 'to_validate' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {statusLabels[summary.paymentStatus]}
                      </span>

                      {/* Compliance Score: Bigger font */}
                      <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border-2 shadow-sm dark:bg-slate-950/50 transition-all ${complianceText} border-current bg-white dark:bg-slate-900`}>
                        {summary.compliance === 100 && (
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        )}
                        <span className="text-xl font-black tracking-tighter">
                          {summary.compliance}%
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="text-[7px] font-bold uppercase opacity-60">Score</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Audit</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 flex-1">
                    <h4 className="font-black dark:text-white text-2xl mb-1 truncate tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-none">{invoice.name}</h4>
                    <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 mb-6 tracking-widest uppercase opacity-80">{summary.vendor}</p>
                    
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-950/30 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-black uppercase tracking-[0.1em]">SIRET</span>
                        <span className="dark:text-slate-200 font-mono font-bold truncate max-w-[120px]">{summary.siret}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-black uppercase tracking-[0.1em]">Date</span>
                        <span className="dark:text-slate-200 font-bold">{summary.date}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-black uppercase tracking-[0.1em]">Fiabilité</span>
                        <span className={`font-black ${summary.fraudCheck?.score! > 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {summary.fraudCheck?.score}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t-2 border-slate-50 dark:border-slate-800">
                    <span className="text-3xl font-black dark:text-white tracking-tighter">{summary.totalTTC}</span>
                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default Vault;
