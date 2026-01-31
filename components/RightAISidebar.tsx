
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage, FileMetadata } from '../types';

interface RightAISidebarProps {
  currentFiles: FileMetadata[];
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "Quelles factures arrivent à échéance ?",
  "Résumé de mes dépenses ce mois-ci",
  "Vérifie la conformité de mes documents",
  "Top 3 de mes fournisseurs"
];

const RightAISidebar: React.FC<RightAISidebarProps> = ({ currentFiles, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Bonjour ! Je suis votre assistant expert en conformité.\n\nJe connais toutes vos factures archivées. **Comment puis-je vous aider aujourd'hui ?**", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // State pour gérer manuellement l'affichage des suggestions
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    // On ferme les suggestions quand on envoie un message pour laisser de la place à la conversation
    setShowSuggestions(false);
    
    setMessages(prev => [...prev, { role: 'user', text: textToSend, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    // Context Optimization: Limit to last 20 completed files
    const relevantFiles = currentFiles
      .filter(f => f.status === 'completed' && f.summary)
      .slice(0, 20); // Limit to 20

    const context = relevantFiles
      .map(f => `- ${f.summary?.vendor}: ${f.summary?.totalTTC} le ${f.summary?.date} (Cat: ${f.summary?.category}, Statut: ${f.summary?.paymentStatus})`)
      .join('\n');

    try {
      const response = await chatWithGemini(textToSend, messages.map(m => ({ role: m.role, text: m.text })), context);
      setMessages(prev => [...prev, { role: 'model', text: response || "Désolé, je n'ai pas pu analyser ces données.", timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Service indisponible temporairement.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Gestion du gras **texte**
      let formattedLine = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-black text-blue-600 dark:text-blue-400">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Gestion des listes à puces
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 mb-1.5 pl-1 items-start">
            <span className="text-blue-500 font-black mt-0.5">•</span>
            <div className="flex-1 text-[11px] font-medium leading-relaxed">
              {formattedLine.map(p => (typeof p === 'string' ? p.replace(/^[-*]\s/, '') : p))}
            </div>
          </div>
        );
      }

      return <p key={i} className={line.trim() === '' ? 'h-3' : 'mb-2.5 last:mb-0'}>{formattedLine}</p>;
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 xl:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed xl:static inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl xl:shadow-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        {/* Header avec Icône centrée et ajustée */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-4 relative">
          <button onClick={onClose} className="absolute top-4 right-4 xl:hidden p-1 text-slate-400 hover:text-slate-600">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 shrink-0 transform hover:scale-105 transition-all duration-300">
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {/* Robot Antenna */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 2a2 2 0 100 4 2 2 0 000-4z" />
              {/* Robot Head */}
              <rect x="3" y="7" width="18" height="14" rx="4" strokeWidth={2} />
              {/* Robot Eyes */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 13h.01M16 13h.01" />
              {/* Robot Mouth */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6" />
            </svg>
          </div>
          <div>
            <h3 className="font-black dark:text-white text-[13px] uppercase tracking-[0.2em] leading-tight mb-1">Expert Fiscal IA</h3>
            <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-70">Analyse de Scellement Active</p>
          </div>
        </div>

        {/* Zone de conversation */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar scroll-smooth bg-slate-50/20 dark:bg-transparent px-0">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} px-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[90%] p-4 rounded-[1.5rem] text-[11px] font-medium leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}>
                {formatText(m.text)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 px-6 animate-pulse">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Audit IA en cours...</span>
            </div>
          )}
        </div>

        {/* Zone d'interaction fixe en bas */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Suggestions cliquables */}
          {showSuggestions && (
            <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1 opacity-60">Analyses rapides :</p>
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)}
                  className="w-full px-4 py-3 bg-blue-600 text-white border border-blue-500 rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 transition-all text-left shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          
          <div className="relative group w-full">
            {/* Bouton Toggle Suggestions */}
            <button 
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`absolute left-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all z-10 ${
                    showSuggestions 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={showSuggestions ? "Masquer les suggestions" : "Afficher les suggestions"}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </button>

            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] py-3.5 pr-12 pl-12 text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white shadow-inner"
            />
            
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group-hover:scale-105 active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default RightAISidebar;
