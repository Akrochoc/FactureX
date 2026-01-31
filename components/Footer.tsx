import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { View } from '../types';

const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <footer className="mt-20 p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-xl mx-4 lg:mx-0">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shrink-0">X</div>
            <span className="text-lg md:text-xl font-black dark:text-white uppercase tracking-tighter">Factur-X Converter</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-loose max-w-sm mb-8 uppercase tracking-tight">
            Leader européen de la conversion Factur-X native. Préparez votre entreprise à la réforme 2026 avec notre IA d'extraction haute précision.
          </p>
          <div className="flex gap-4">
             {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg></div>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-2">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Navigation</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              <li><button onClick={() => navigateTo(View.LEGAL, 'features')} className="hover:text-blue-600 transition-colors text-left">Fonctionnalités</button></li>
              <li><button onClick={() => navigateTo(View.PRICING)} className="hover:text-blue-600 transition-colors text-left">Tarifs Cloud</button></li>
              <li><button onClick={() => navigateTo(View.LEGAL, 'api')} className="hover:text-blue-600 transition-colors text-left">API Docs</button></li>
              <li><button onClick={() => navigateTo(View.LEGAL, 'support')} className="hover:text-blue-600 transition-colors text-left">Support</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Légal</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              <li><button onClick={() => navigateTo(View.LEGAL, 'privacy')} className="hover:text-blue-600 transition-colors text-left">Confidentialité</button></li>
              <li><button onClick={() => navigateTo(View.LEGAL, 'terms')} className="hover:text-blue-600 transition-colors text-left">CGV / CGU</button></li>
              <li><button onClick={() => navigateTo(View.LEGAL, 'gdpr')} className="hover:text-blue-600 transition-colors text-left">Conformité RGPD</button></li>
              <li><button onClick={() => navigateTo(View.LEGAL, 'security')} className="hover:text-blue-600 transition-colors text-left">Audit Sécurité</button></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">© 2026 Factur-X Converter • Propriété du groupe Digital Compliance</span>
         <div className="flex gap-8">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Système : Opérationnel</span>
            </div>
            <div className="flex items-center gap-2">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" className="w-4 h-3 rounded-sm opacity-50" alt="EU Flag" />
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Hébergé en UE</span>
            </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
