
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'PROFILE';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser, onLogin, onLogout, onOpenSettings }) => {
  const [view, setView] = useState<AuthView>(currentUser ? 'PROFILE' : 'LOGIN');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [showSignUpCTA, setShowSignUpCTA] = useState(false); // New state for login error CTA
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
    siret: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset view when modal opens/closes based on auth state
  React.useEffect(() => {
    if (isOpen) {
      setView(currentUser ? 'PROFILE' : 'LOGIN');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear passwords on open
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowResend(false);
      setShowSignUpCTA(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Validation helpers
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
    // Remove spaces for validation logic, but we check if the result is purely numeric
    const cleanSiret = siret.replace(/\s/g, '');
    return {
        isNumeric: /^\d+$/.test(cleanSiret),
        isValidLength: cleanSiret.length === 14,
        cleanValue: cleanSiret
    };
  };

  // Helper to detect email provider URL
  const getEmailProviderLink = (email: string) => {
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain) return 'mailto:';
      
      if (domain.includes('gmail')) return 'https://mail.google.com';
      if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'https://outlook.live.com';
      if (domain.includes('yahoo')) return 'https://mail.yahoo.com';
      if (domain.includes('proton')) return 'https://mail.proton.me';
      if (domain.includes('icloud')) return 'https://www.icloud.com/mail';
      
      return `mailto:${email}`; // Fallback to default client
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowResend(false);
    setShowSignUpCTA(false);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) throw error;
        
        // App.tsx onAuthStateChange handles the state update
        onClose();
    } catch (err: any) {
        if (err.message && err.message.includes("Email not confirmed")) {
            setErrorMsg("Veuillez confirmer votre email pour accéder à votre compte.");
            setShowResend(true);
        } else if (err.message && (err.message.includes("Invalid login credentials") || err.message.includes("Invalid email or password"))) {
            // Specific handling for invalid credentials (which implies user might not exist)
            setErrorMsg("Identifiants incorrects ou compte inexistant.");
            setShowSignUpCTA(true);
        } else {
            setErrorMsg(err.message || "Erreur de connexion");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
      if (!formData.email) return;
      setLoading(true);
      setErrorMsg(null);
      
      try {
          const { error } = await supabase.auth.resend({
              type: 'signup',
              email: formData.email
          });
          
          if (error) throw error;
          
          setSuccessMsg("Email de confirmation renvoyé ! Vérifiez vos spams.");
          setShowResend(false);
      } catch (err: any) {
          setErrorMsg(err.message || "Erreur lors de l'envoi");
      } finally {
          setLoading(false);
      }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    // 1. Check Required Fields
    if (!formData.name || !formData.company || !formData.email || !formData.siret || !formData.password || !formData.confirmPassword) {
        setErrorMsg("Tous les champs sont obligatoires.");
        return;
    }

    // 2. Validate Email Format
    if (!validateEmail(formData.email)) {
        setErrorMsg("Le format de l'adresse email est invalide (exemple: nom@domaine.com).");
        return;
    }

    // 3. Validate SIRET (Account Number)
    const siretValidation = validateSiret(formData.siret);
    if (!siretValidation.isNumeric) {
        setErrorMsg("Le numéro de compte (SIRET) doit contenir uniquement des chiffres.");
        return;
    }
    if (!siretValidation.isValidLength) {
        setErrorMsg("Le numéro de compte (SIRET) doit comporter exactement 14 chiffres.");
        return;
    }

    // 4. Password Complexity Check
    const rules = checkPasswordRules(formData.password);
    if (!Object.values(rules).every(Boolean)) {
        setErrorMsg("Le mot de passe ne respecte pas les critères de sécurité.");
        return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    name: formData.name,
                    company: formData.company,
                    siret: siretValidation.cleanValue, // Save cleaned SIRET
                    plan: 'free',
                    role: 'admin',
                    avatarSeed: formData.name.replace(/\s/g, '')
                }
            }
        });

        if (error) throw error;

        // Check if session is null, meaning email confirmation is required
        if (data.user && !data.session) {
            setSuccessMsg("Compte créé ! Veuillez cliquer sur le lien reçu par email pour l'activer.");
            setView('LOGIN');
        } else {
            // Auto-login case (if confirmation is disabled in Supabase)
            onClose();
        }
    } catch (err: any) {
        setErrorMsg(err.message || "Erreur d'inscription");
    } finally {
        setLoading(false);
    }
  };

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      onLogout();
      onClose();
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
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <Item met={rules.length} label="8 caractères min." />
              <Item met={rules.upper} label="1 Majuscule" />
              <Item met={rules.lower} label="1 Minuscule" />
              <Item met={rules.number} label="1 Chiffre" />
              <Item met={rules.special} label="1 Caractère spécial" />
          </div>
      );
  };

  const renderLogin = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black dark:text-white mb-2">Connexion</h3>
      </div>

      {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs font-bold border border-green-100 text-center flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span>{successMsg}</span>
              </div>
              <a 
                href={getEmailProviderLink(formData.email)} 
                target="_blank" 
                rel="noreferrer"
                className="bg-green-600 text-white py-2.5 px-4 rounded-lg uppercase tracking-widest text-[10px] font-black hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Ouvrir ma boite mail
              </a>
          </div>
      )}

      {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 text-center flex flex-col gap-3 items-center">
              <span>{errorMsg}</span>
              {showResend && (
                  <button 
                    type="button" 
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Renvoyer l'email de confirmation
                  </button>
              )}
              {showSignUpCTA && (
                  <button 
                    type="button"
                    onClick={() => { setView('REGISTER'); setErrorMsg(null); }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 w-full"
                  >
                    Créer un compte gratuitement
                  </button>
              )}
          </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email professionnel</label>
          <input 
            type="email" 
            required
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
            placeholder="nom@entreprise.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mot de passe</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>
        <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      
      <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500">Pas encore de compte ?</p>
        <button onClick={() => { setView('REGISTER'); setSuccessMsg(null); setErrorMsg(null); setShowSignUpCTA(false); }} className="text-blue-600 font-black text-xs uppercase tracking-widest mt-2 hover:underline">
          Créer un compte entreprise
        </button>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black dark:text-white mb-2">Inscription</h3>
      </div>
      
      {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 text-center">
              {errorMsg}
          </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom complet *</label>
            <input 
                type="text" 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white"
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
            />
            </div>
            <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Société *</label>
            <input 
                type="text" 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white"
                placeholder="Dupont SAS"
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
            />
            </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email professionnel *</label>
          <input 
            type="email" 
            required
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white"
            placeholder="jean@dupont.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SIRET (14 chiffres) *</label>
          <input 
            type="text" 
            required
            maxLength={16} // Allow some spacing
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500 focus:outline-none dark:text-white"
            placeholder="12345678900012"
            value={formData.siret}
            onChange={e => setFormData({...formData, siret: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mot de passe *</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation *</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                required
                className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-xl px-4 py-3 pr-10 text-sm font-bold focus:border-blue-500 focus:outline-none dark:text-white ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Password Requirements UI */}
        <PasswordRequirementsList password={formData.password} />

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mt-2 disabled:opacity-50">
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
      
      <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => { setView('LOGIN'); setSuccessMsg(null); setErrorMsg(null); setShowSignUpCTA(false); }} className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
          Retour à la connexion
        </button>
      </div>
    </div>
  );

  const renderProfile = () => {
    if (!currentUser) return null;
    const avatarSrc = currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatarSeed}`;
    
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 p-1 mb-4 shadow-xl transition-transform duration-300 overflow-hidden">
                <img 
                    src={avatarSrc} 
                    alt="Avatar" 
                    className="w-full h-full rounded-2xl bg-white object-cover"
                />
            </div>
            <h3 className="text-2xl font-black dark:text-white">{currentUser.name}</h3>
            <p className="text-blue-600 font-bold text-sm">{currentUser.company}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                <span className="text-xs font-bold dark:text-white">{currentUser.email}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SIRET</span>
                <span className="text-xs font-mono dark:text-white bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{currentUser.siret}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Actuel</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${currentUser.plan === 'pro' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                    {currentUser.plan}
                </span>
            </div>
        </div>

        <div className="flex flex-col gap-3">
            <button 
                onClick={() => { onClose(); onOpenSettings(); }}
                className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-white"
            >
                Paramètres du compte
            </button>
            <button 
                onClick={handleSignOut} 
                className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
                Déconnexion
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-white/20 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-20">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {view === 'LOGIN' && renderLogin()}
        {view === 'REGISTER' && renderRegister()}
        {view === 'PROFILE' && renderProfile()}
      </div>
    </div>
  );
};

export default AuthModal;
