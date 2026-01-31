
import React, { useState, useEffect, useRef } from 'react';
import { User, Notification } from '../types';
import Footer from './Footer';

interface SettingsProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  addNotification?: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, addNotification }) => {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    company: '',
    siret: '',
    address: '',
    tva: '',
    role: 'user',
    plan: 'free',
    avatarSeed: 'Guest',
    avatarUrl: undefined
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  // Password visibility states
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [activeSection, setActiveSection] = useState<'profile' | 'company' | 'security'>('profile');
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
      setIsDirty(true);
    }
  };

  // Password validation helper
  const checkPasswordRules = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateSiret = (siret: string) => {
    const cleanSiret = siret.replace(/\s/g, '');
    return {
        isNumeric: /^\d+$/.test(cleanSiret),
        isValidLength: cleanSiret.length === 14,
        cleanValue: cleanSiret
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeSection === 'security') {
        // Password Validation
        if (!passwordData.current) {
            addNotification?.({ title: "Erreur de sécurité", description: "Le mot de passe actuel est requis pour autoriser le changement.", type: "error" });
            return;
        }

        const rules = checkPasswordRules(passwordData.newPass);
        if (!Object.values(rules).every(Boolean)) {
             addNotification?.({ title: "Mot de passe faible", description: "Le mot de passe ne respecte pas les critères de sécurité.", type: "warning" });
             return;
        }

        if (passwordData.newPass !== passwordData.confirm) {
            addNotification?.({ title: "Non correspondance", description: "La confirmation ne correspond pas au nouveau mot de passe.", type: "error" });
            return;
        }

        // Simulate API Success
        addNotification?.({ title: "Sécurité mise à jour", description: "Votre mot de passe a été modifié avec succès.", type: "success" });
        setPasswordData({ current: '', newPass: '', confirm: '' });
        setIsDirty(false);

    } else {
        // Profile & Company Validation
        if (activeSection === 'profile') {
            if (!formData.name || !formData.email) {
                addNotification?.({ title: "Champs requis", description: "Le nom et l'email sont obligatoires.", type: "error" });
                return;
            }
            if (!validateEmail(formData.email)) {
                addNotification?.({ title: "Format invalide", description: "L'adresse email n'est pas valide.", type: "error" });
                return;
            }
        }

        if (activeSection === 'company') {
            if (!formData.company || !formData.siret) {
                addNotification?.({ title: "Champs requis", description: "Le nom de la société et le SIRET sont obligatoires.", type: "error" });
                return;
            }
            const siretVal = validateSiret(formData.siret);
            if (!siretVal.isNumeric || !siretVal.isValidLength) {
                addNotification?.({ title: "SIRET invalide", description: "Le SIRET doit contenir exactement 14 chiffres.", type: "error" });
                return;
            }
            // Auto-clean the input state
            setFormData(prev => ({ ...prev, siret: siretVal.cleanValue }));
        }

        // Normal Profile Update
        onUpdateUser(formData);
        setIsDirty(false);
    }
  };

  const PasswordRequirementsList = ({ password }: { password: string }) => {
      const rules = checkPasswordRules(password);
      
      const Item = ({ met, label }: { met: boolean; label: string }) => (
          <div className={`flex items-center gap-2 text-[10px] font-bold ${met ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${met ? 'bg-green-100 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                  {met && <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
              </div>
              {label}
          </div>
      );

      return (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <Item met={rules.length} label="8 caractères min." />
              <Item met={rules.upper} label="1 Majuscule" />
              <Item met={rules.lower} label="1 Minuscule" />
              <Item met={rules.number} label="1 Chiffre" />
              <Item met={rules.special} label="1 Caractère spécial" />
          </div>
      );
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black dark:text-white mb-2">Connexion requise</h2>
          <p className="text-slate-500">Veuillez vous connecter pour accéder aux paramètres.</p>
        </div>
      </div>
    );
  }

  const avatarSrc = formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed}`;

  return (
    <div className="h-full overflow-y-auto w-full">
      <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
        <header className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-black dark:text-white tracking-tight mb-2">Paramètres du <span className="text-blue-600">Compte</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest opacity-60">Gérez vos informations personnelles et professionnelles</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 flex-shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex-shrink-0 w-auto lg:w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap lg:whitespace-normal ${
                activeSection === 'profile' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-transparent' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
              }`}
            >
              Mon Profil
            </button>
            <button
              onClick={() => setActiveSection('company')}
              className={`flex-shrink-0 w-auto lg:w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap lg:whitespace-normal ${
                activeSection === 'company' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-transparent' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
              }`}
            >
              Entreprise
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`flex-shrink-0 w-auto lg:w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap lg:whitespace-normal ${
                activeSection === 'security' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-transparent' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
              }`}
            >
              Sécurité
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 min-h-[500px]">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative h-full">
              {activeSection === 'profile' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-50 dark:border-slate-800 text-center sm:text-left">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-3xl bg-slate-100 p-1 shadow-lg overflow-hidden mx-auto sm:mx-0">
                        <img 
                          src={avatarSrc} 
                          alt="Avatar" 
                          className="w-full h-full rounded-2xl bg-white object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] text-white font-black uppercase tracking-widest">Modifier</span>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-black dark:text-white">{formData.name || 'Utilisateur'}</h3>
                      <p className="text-sm text-slate-500 font-medium">{formData.email}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        formData.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Plan {formData.plan}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom Complet</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Professionnel</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'company' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-black dark:text-white mb-2">Informations Légales</h3>
                    <p className="text-xs text-slate-500">Ces informations figureront sur vos rapports de conformité.</p>
                  </div>

                  {/* RGPD / Data Sovereignty Badge */}
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-4">
                     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shrink-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" className="w-6 h-4 rounded-sm shadow-sm" alt="EU Flag" />
                     </div>
                     <div>
                        <h4 className="text-xs font-black dark:text-white uppercase tracking-wide mb-1">Hébergement des Données</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                            Vos données sont hébergées de manière sécurisée en <strong>Union Européenne (Frankfurt)</strong> via Supabase, garantissant une conformité totale au <strong>RGPD</strong>.
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Raison Sociale</label>
                      <input 
                        type="text" 
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SIRET (14 chiffres)</label>
                        <input 
                          type="text" 
                          value={formData.siret}
                          onChange={(e) => handleChange('siret', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Numéro TVA (Optionnel)</label>
                        <input 
                          type="text" 
                          value={formData.tva || ''}
                          onChange={(e) => handleChange('tva', e.target.value)}
                          placeholder="FR..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adresse du Siège</label>
                      <textarea 
                        value={formData.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-black dark:text-white mb-2">Mot de passe</h3>
                    <p className="text-xs text-slate-500">Dernière modification il y a 3 mois.</p>
                  </div>

                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mot de passe actuel</label>
                      <div className="relative">
                        <input 
                            type={showCurrentPass ? "text" : "password"} 
                            value={passwordData.current}
                            onChange={(e) => handlePasswordChange('current', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                        >
                            {showCurrentPass ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                      <div className="relative">
                        <input 
                            type={showNewPass ? "text" : "password"} 
                            value={passwordData.newPass}
                            onChange={(e) => handlePasswordChange('newPass', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                        >
                            {showNewPass ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                      </div>
                      
                      {/* Password Requirements Display */}
                      <PasswordRequirementsList password={passwordData.newPass} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirmer</label>
                      <div className="relative">
                        <input 
                            type={showConfirmPass ? "text" : "password"} 
                            value={passwordData.confirm}
                            onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                            className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-xl px-4 py-3 pr-10 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors ${
                                passwordData.confirm && passwordData.newPass !== passwordData.confirm 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-slate-100 dark:border-slate-700'
                            }`}
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                        >
                            {showConfirmPass ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isDirty && (
                <div className="fixed bottom-6 right-6 md:absolute md:bottom-8 md:right-8 z-20 animate-in slide-in-from-bottom-4 fade-in">
                  <button 
                    type="submit" 
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Settings;
