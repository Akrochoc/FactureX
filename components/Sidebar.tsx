
import React from 'react';
import { View } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isDark, toggleTheme, isOpen, onClose }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Tableau de bord', icon: <Icons.Dashboard /> },
    { id: View.CONVERTER, label: 'Convertisseur', icon: <Icons.Converter /> },
    { id: View.AUDIT, label: 'Audit', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )},
    { id: View.VAULT, label: 'Coffre-fort', icon: <Icons.Vault /> },
    { id: View.PRICING, label: 'Tarifs', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: View.LEGAL, label: "Centre d'Infos", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    )},
    { id: View.STRATEGY, label: 'Stratégie Projet', icon: <Icons.Strategy /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">X</div>
              <h1 className="text-xl font-bold tracking-tight dark:text-white">Factur-X</h1>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all"
          >
            {isDark ? <Icons.Sun /> : <Icons.Moon />}
            <span>{isDark ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>

          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20">
            <p className="text-xs font-medium opacity-80 mb-1 text-blue-100">Passer à</p>
            <p className="text-sm font-bold mb-3">Premium</p>
            <button 
              onClick={() => { setView(View.PRICING); onClose(); }}
              className="w-full bg-white text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
            >
              Voir les offres
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
