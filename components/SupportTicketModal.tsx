import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';
import { supabase } from '../lib/supabaseClient';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

interface DropdownOption {
    value: string;
    label: string;
    color?: string;
}

interface CustomDropdownProps {
    label: string;
    value: string;
    options: DropdownOption[];
    onChange: (val: string) => void;
    zIndex?: number;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, value, options, onChange, zIndex = 20 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative" ref={containerRef}>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
             <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-50 dark:bg-slate-800 border-2 ${
                    isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 dark:border-slate-700'
                } rounded-xl px-4 py-3 text-sm font-bold dark:text-white flex items-center justify-between transition-all hover:border-blue-300 dark:hover:border-slate-600 focus:outline-none`}
             >
                <div className="flex items-center gap-2">
                    {selectedOption?.color && <div className={`w-2 h-2 rounded-full ${selectedOption.color}`}></div>}
                    <span className="truncate">{selectedOption?.label}</span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
             </button>

             {isOpen && (
                 <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2"
                    style={{ zIndex }}
                >
                     <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                         {options.map((opt) => (
                             <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                                    value === opt.value 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                             >
                                 <div className="flex items-center gap-2">
                                     {opt.color && <div className={`w-2 h-2 rounded-full ${value === opt.value ? 'bg-white' : opt.color}`}></div>}
                                     {opt.label}
                                 </div>
                                 {value === opt.value && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                             </button>
                         ))}
                     </div>
                 </div>
             )}
        </div>
    );
};

const SupportTicketModal: React.FC<SupportTicketModalProps> = ({ isOpen, onClose, addNotification }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    message: '',
    priority: 'medium'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
            throw new Error("Vous devez être connecté pour ouvrir un ticket.");
        }

        const ticketRef = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const { error } = await supabase.from('tickets').insert({
            user_id: userData.user.id,
            ticket_ref: ticketRef,
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            message: formData.message,
            status: 'open'
        });

        if (error) throw error;
        
        addNotification({
            title: `Ticket créé #${ticketRef}`,
            description: 'Votre demande a été enregistrée en base de données. Un technicien vous répondra sous 4h.',
            type: 'success'
        });
        
        onClose();
        setFormData({ subject: '', category: 'technical', message: '', priority: 'medium' });

    } catch (err: any) {
        console.error(err);
        addNotification({
            title: "Erreur",
            description: err.message || "Impossible de créer le ticket.",
            type: "error"
        });
    } finally {
        setLoading(false);
    }
  };

  const categories: DropdownOption[] = [
      { value: 'technical', label: 'Technique' },
      { value: 'billing', label: 'Facturation' },
      { value: 'feature', label: 'Suggestion' },
      { value: 'other', label: 'Autre' }
  ];

  const priorities: DropdownOption[] = [
      { value: 'low', label: 'Basse', color: 'bg-slate-400' },
      { value: 'medium', label: 'Moyenne', color: 'bg-blue-400' },
      { value: 'high', label: 'Haute', color: 'bg-amber-400' },
      { value: 'critical', label: 'Critique', color: 'bg-red-500' }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
        <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 border border-white/20 relative"
            onClick={e => e.stopPropagation()}
        >
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400 transform -rotate-6 shadow-inner">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-2">Nouveau Ticket</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Support technique & commercial</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sujet</label>
                    <input 
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Ex: Problème d'export API..."
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <CustomDropdown 
                        label="Catégorie" 
                        value={formData.category} 
                        options={categories} 
                        onChange={(val) => setFormData({...formData, category: val})} 
                        zIndex={30}
                     />
                     <CustomDropdown 
                        label="Priorité" 
                        value={formData.priority} 
                        options={priorities} 
                        onChange={(val) => setFormData({...formData, priority: val})} 
                        zIndex={30}
                     />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Message</label>
                    <textarea 
                        required
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                        placeholder="Décrivez votre problème en détail..."
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Envoi...
                            </>
                        ) : (
                            'Créer le ticket'
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default SupportTicketModal;