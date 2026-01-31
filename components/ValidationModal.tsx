
import React, { useState } from 'react';
import { FileMetadata, InvoiceStatus } from '../types';

interface ValidationModalProps {
  invoice: FileMetadata;
  onClose: () => void;
  onSave: (updated: FileMetadata) => void;
}

const statusLabels: Record<string, string> = {
  to_validate: 'À valider',
  validated: 'Validé',
  paid: 'Payé'
};

const ValidationModal: React.FC<ValidationModalProps> = ({ invoice, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...invoice.summary! });
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleSave = () => {
    onSave({ ...invoice, summary: formData });
    onClose();
  };

  const isPdf = invoice.type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full h-full flex flex-col md:flex-row bg-white dark:bg-slate-900 overflow-hidden">
        
        {/* LEFT PANE: DOCUMENT VIEWER */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-900 relative flex flex-col border-b md:border-b-0 md:border-r border-slate-700">
           <div className="absolute top-4 left-4 z-20 flex gap-2">
               <button onClick={onClose} className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
           </div>

           {/* Zoom Controls */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
              <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-2 text-white hover:bg-white/20 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
              <span className="text-[10px] font-black text-white w-12 text-center">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="p-2 text-white hover:bg-white/20 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
           </div>

           <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-950/50">
             <div 
               style={{ width: `${zoomLevel}%`, transition: 'width 0.2s ease-out' }}
               className="shadow-2xl rounded-lg overflow-hidden border border-white/10"
             >
                {invoice.preview ? (
                  isPdf ? (
                    <object data={invoice.preview} type="application/pdf" className="w-full aspect-[1/1.4] bg-white">
                         <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4 text-center">
                            <p className="text-sm font-bold mb-2">Aperçu PDF natif non supporté</p>
                        </div>
                    </object>
                  ) : (
                    <img src={invoice.preview} className="w-full h-auto object-contain bg-white" alt="Invoice Preview" />
                  )
                ) : (
                  <div className="text-slate-500 font-bold">Aperçu non disponible</div>
                )}
             </div>
           </div>
        </div>

        {/* RIGHT PANE: FORM */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-white dark:bg-slate-900">
           <header className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
             <div>
               <div className="flex items-center gap-3 mb-1">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                 <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Révision IA</h3>
               </div>
               <p className="text-xs text-slate-500 font-medium">Validez les données extraites pour le scellement.</p>
             </div>
             <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                Mode Expert
             </div>
           </header>

           <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Identité Tiers
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Fournisseur</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                      value={formData.vendor} 
                      onChange={e => setFormData(f => ({ ...f, vendor: e.target.value }))} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Date Émission</label>
                        <input 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                        value={formData.date} 
                        onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} 
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">SIRET</label>
                        <input 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-bold dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                        value={formData.siret} 
                        onChange={e => setFormData(f => ({ ...f, siret: e.target.value }))} 
                        />
                     </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Montants
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Total TTC</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-blue-600 focus:border-blue-500 focus:outline-none transition-colors"
                      value={formData.totalTTC} 
                      onChange={e => setFormData(f => ({ ...f, totalTTC: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Dont TVA</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                      value={formData.tax} 
                      onChange={e => setFormData(f => ({ ...f, tax: e.target.value }))} 
                    />
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    Classement
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Catégorie Comptable</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white appearance-none focus:border-blue-500 focus:outline-none transition-colors"
                      value={formData.category} 
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option>Énergie</option>
                      <option>Cloud & IT</option>
                      <option>Télécom</option>
                      <option>Services</option>
                      <option>Fournitures</option>
                      <option>Déplacements</option>
                      <option>Autres</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Statut Workflow</label>
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {(['to_validate', 'validated', 'paid'] as InvoiceStatus[]).map(s => (
                        <button 
                          key={s}
                          onClick={() => setFormData(f => ({ ...f, paymentStatus: s }))}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                            formData.paymentStatus === s 
                              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {statusLabels[s] || s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
           </div>

           <footer className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <button onClick={onClose} className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-colors">
                 Annuler
              </button>
              <button onClick={handleSave} className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                 Valider & Sceller
              </button>
           </footer>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
