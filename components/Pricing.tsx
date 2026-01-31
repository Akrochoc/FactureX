
import React, { useState } from 'react';
import Footer from './Footer';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const ALL_FEATURES = [
    "Conversion PDF/Photo illimitée",
    "Extraction IA haute précision",
    "Coffre-fort légal (10 ans)",
    "Mail-to-X : conversion par email",
    "Support standard par chat",
    "Mode Révision Human-in-the-Loop",
    "Vérification SIRET & IBAN temps réel",
    "Détection intelligente de doublons",
    "Chat IA contextuel (Invoice RAG)",
    "Workflow d'approbation & Paiement",
    "Catégorisation IA & Analytics",
    "Multi-dossiers (jusqu'à 50 clients)",
    "Exports ERP personnalisés",
    "Journal d'achats automatique",
    "Accès API REST complet",
    "SLA de disponibilité 99.9%"
  ];

  const plans = [
    {
      name: "Indépendant",
      monthlyPrice: 19,
      description: "L'essentiel pour être en conformité sans effort.",
      includedFeatures: [
        "Conversion PDF/Photo illimitée",
        "Extraction IA haute précision",
        "Coffre-fort légal (10 ans)",
        "Mail-to-X : conversion par email",
        "Support standard par chat",
        "Mode Révision Human-in-the-Loop"
      ],
      cta: "Choisir ce plan",
      popular: false
    },
    {
      name: "Cabinet / PME",
      monthlyPrice: 49,
      description: "Gérez vos clients depuis une interface unique.",
      includedFeatures: [
        "Conversion PDF/Photo illimitée",
        "Extraction IA haute précision",
        "Coffre-fort légal (10 ans)",
        "Mail-to-X : conversion par email",
        "Support standard par chat",
        "Mode Révision Human-in-the-Loop",
        "Vérification SIRET & IBAN temps réel",
        "Détection intelligente de doublons",
        "Chat IA contextuel (Invoice RAG)",
        "Workflow d'approbation & Paiement",
        "Catégorisation IA & Analytics",
        "Multi-dossiers (jusqu'à 50 clients)"
      ],
      cta: "Déployer le cabinet",
      popular: true
    },
    {
      name: "Entreprise",
      monthlyPrice: null,
      description: "Intégration native, gros volumes et support dédié.",
      includedFeatures: ALL_FEATURES,
      cta: "Contacter un expert",
      popular: false
    }
  ];

  const getDisplayPrice = (monthlyPrice: number | null) => {
    if (monthlyPrice === null) return "Sur-mesure";
    return isAnnual ? `${monthlyPrice * 10}€` : `${monthlyPrice}€`;
  };

  const getPriceSubtext = (monthlyPrice: number | null) => {
    if (monthlyPrice === null) return "Projet personnalisé";
    return isAnnual ? "/an" : "/mois";
  };

  return (
    <div className="h-full overflow-y-auto w-full scrollbar-hide">
      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
        {/* Offre d'essai */}
        <div className="mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 bg-blue-600 text-white p-8 md:px-12 md:py-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/30 border border-blue-400 w-full max-w-6xl mx-auto relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative z-10">
               <div className="flex items-center gap-4 shrink-0">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse shadow-inner border border-white/20">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span className="text-xl font-black uppercase tracking-widest whitespace-nowrap">Offre Découverte</span>
               </div>
               <div className="hidden md:block h-12 w-px bg-white/20"></div>
               <p className="text-lg md:text-xl font-bold leading-snug">
                 Profitez de <span className="bg-white text-blue-600 px-3 py-1 rounded-xl font-black whitespace-nowrap shadow-lg">5 factures offertes</span> ou 7 jours d'essai gratuit.
               </p>
            </div>

            <button className="relative z-10 bg-slate-900 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl whitespace-nowrap w-full md:w-auto border border-white/10 ring-4 ring-transparent hover:ring-white/20">
              Essayer maintenant
            </button>
          </div>
        </div>

        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 dark:text-white tracking-tighter uppercase leading-none break-words">
            Tarifs <span className="text-blue-600">Transparents</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-10 bg-slate-100 dark:bg-slate-900 w-full sm:w-fit mx-auto p-2 rounded-3xl md:rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-sm max-w-sm sm:max-w-none">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${!isAnnual ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400'}`}
            >
              Mensuel
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isAnnual ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400'}`}
            >
              Annuel
              <span className="bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">-2 mois</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-24">
          {plans.map((plan, idx) => (
            <div key={idx} className={`flex flex-col h-full rounded-[2.5rem] md:rounded-[4rem] transition-all relative group ${
              plan.popular ? 'bg-gradient-to-br from-blue-600 to-blue-400 p-1 shadow-2xl lg:scale-105 z-10' : 'bg-slate-200 dark:bg-slate-800 p-[1px]'
            }`}>
              <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.4rem] md:rounded-[3.9rem] p-6 md:p-10 lg:p-8 xl:p-10">
                {plan.popular && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase shadow-xl tracking-[0.2em] border-4 border-white dark:border-slate-900 whitespace-nowrap z-20">Le Choix Expert</div>}
                
                {/* Changed from xl:flex-row to flex-col to prevent horizontal overflow in columns */}
                <div className="flex flex-col items-center gap-6 mb-8 md:mb-12 pb-8 md:pb-10 border-b-2 border-slate-50 dark:border-slate-800 text-center">
                  <div className="flex-shrink-0 flex flex-col items-center">
                     <span className="text-3xl md:text-4xl lg:text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tighter break-words max-w-full">{getDisplayPrice(plan.monthlyPrice)}</span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 opacity-60">{getPriceSubtext(plan.monthlyPrice)}</span>
                  </div>
                  <div className="w-full">
                    <h3 className="font-black dark:text-white text-xl md:text-2xl mb-2 uppercase tracking-tighter leading-none break-words">{plan.name}</h3>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-4">{plan.description}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-5 md:space-y-7 mb-10 md:mb-16">
                  {ALL_FEATURES.map((feature, fIdx) => {
                    const included = plan.includedFeatures.includes(feature);
                    return (
                      <div key={fIdx} className={`flex items-start gap-3 md:gap-5 transition-all ${included ? 'opacity-100' : 'opacity-20'}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {included ? (
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[11px] md:text-[12px] leading-tight text-left ${included ? 'font-black dark:text-slate-100' : 'font-bold text-slate-400'}`}>
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button className={`w-full py-4 md:py-6 rounded-3xl md:rounded-[2.5rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-2 active:scale-95 ${
                  plan.popular ? 'bg-blue-600 text-white shadow-blue-500/40 hover:bg-blue-700' : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-black'
                }`}>
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Pricing;
