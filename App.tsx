import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, FileMetadata, Notification, InvoiceStatus, User } from './types';
import { NavigationContext } from './contexts/NavigationContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Converter from './components/Converter';
import Vault from './components/Vault';
import Pricing from './components/Pricing';
import ProjectStrategy from './components/ProjectStrategy';
import LegalDocs from './components/LegalDocs';
import RightAISidebar from './components/RightAISidebar';
import NotificationMenu from './components/NotificationMenu';
import ComplianceReportModal from './components/ComplianceReportModal';
import ValidationModal from './components/ValidationModal';
import AuthModal from './components/AuthModal';
import Settings from './components/Settings';
import ComplianceAudit from './components/ComplianceAudit'; // Import new component
import { supabase } from './lib/supabaseClient';

const viewLabels: Record<View, string> = {
  [View.DASHBOARD]: 'TABLEAU DE BORD',
  [View.CONVERTER]: 'CONVERTISSEUR',
  [View.AUDIT]: 'AUDIT IA', // Add label
  [View.VAULT]: 'COFFRE-FORT',
  [View.PRICING]: 'TARIFS',
  [View.STRATEGY]: 'STRATÉGIE',
  [View.SETTINGS]: 'PARAMÈTRES',
  [View.LEGAL]: 'INFOS & LÉGAL'
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  to_validate: 'À valider',
  validated: 'Validé',
  paid: 'Payé'
};

const App: React.FC = () => {
  const [currentView, setView] = useState<View>(View.DASHBOARD);
  const [legalTab, setLegalTab] = useState<string>('privacy'); // Default legal tab
  const [isDark, setIsDark] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  
  // Data States
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [demoFiles, setDemoFiles] = useState<FileMetadata[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [highlightedFileId, setHighlightedFileId] = useState<string | null>(null);
  const [selectedInvoiceForReport, setSelectedInvoiceForReport] = useState<FileMetadata | null>(null);
  const [invoiceToValidate, setInvoiceToValidate] = useState<FileMetadata | null>(null);
  
  // Mobile UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Map Supabase user to App user
        const meta = session.user.user_metadata;
        setCurrentUser({
            name: meta.name || session.user.email,
            email: session.user.email!,
            company: meta.company || 'Ma Société',
            siret: meta.siret || '',
            role: meta.role || 'admin',
            plan: meta.plan || 'free',
            avatarSeed: (meta.name || 'User').replace(/\s/g, ''),
            avatarUrl: meta.avatarUrl
        });
        setDemoMode(false);
        fetchUserInvoices(session.user.id);
      } else {
        setDemoMode(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         const meta = session.user.user_metadata;
         setCurrentUser({
            name: meta.name || session.user.email,
            email: session.user.email!,
            company: meta.company || 'Ma Société',
            siret: meta.siret || '',
            role: meta.role || 'admin',
            plan: meta.plan || 'free',
            avatarSeed: (meta.name || 'User').replace(/\s/g, ''),
            avatarUrl: meta.avatarUrl
        });
        setDemoMode(false);
        fetchUserInvoices(session.user.id);
      } else {
        setCurrentUser(null);
        setDemoMode(true);
        setUploadedFiles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Real User Invoices
  const fetchUserInvoices = async (userId: string) => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching invoices:", error);
        return;
    }

    if (data) {
        const mappedFiles: FileMetadata[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            size: row.size,
            type: row.type || 'application/pdf',
            status: row.status,
            preview: row.file_url, // Supabase storage URL
            summary: row.summary
        }));
        setUploadedFiles(mappedFiles);
    }
  };

  // Fetch Demo Invoices
  useEffect(() => {
    if (demoMode) {
      const fetchDemo = async () => {
        const { data, error } = await supabase
          .from('demo_invoices')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mappedDemo: FileMetadata[] = data.map((row: any) => ({
            id: row.id, // Keep original UUID
            name: row.name,
            size: row.size,
            type: row.type || 'application/pdf',
            status: row.status,
            preview: row.file_url,
            summary: row.summary
          }));
          setDemoFiles(mappedDemo);

          // Génération dynamique des notifications basées sur les données DB
          const dynamicNotifications: Notification[] = [];
          
          mappedDemo.forEach(inv => {
             // Notification pour fraude/doublon
             if (inv.summary?.fraudCheck?.isDuplicate) {
                 dynamicNotifications.push({
                     id: `fraud-${inv.id}`,
                     title: 'Alerte Doublon Critique',
                     description: `Une tentative de doublon a été bloquée pour ${inv.summary.vendor}.`,
                     type: 'error',
                     timestamp: new Date(),
                     read: false,
                     relatedId: inv.id
                 });
             }
             // Notification pour anomalies
             else if (inv.summary?.compliance && inv.summary.compliance < 60) {
                 dynamicNotifications.push({
                     id: `alert-${inv.id}`,
                     title: 'Conformité Faible',
                     description: `La facture ${inv.summary.vendor} présente des anomalies majeures.`,
                     type: 'warning',
                     timestamp: new Date(),
                     read: false,
                     relatedId: inv.id
                 });
             }
             // Notification pour validation
             else if (inv.summary?.paymentStatus === 'to_validate') {
                 dynamicNotifications.push({
                     id: `val-${inv.id}`,
                     title: 'Validation Requise',
                     description: `Nouvelle facture de ${inv.summary.vendor} (${inv.summary.totalTTC}) en attente.`,
                     type: 'info',
                     timestamp: new Date(),
                     read: false,
                     relatedId: inv.id
                 });
             }
          });

          setNotifications(dynamicNotifications);
        }
      };
      fetchDemo();
    } else {
      setDemoFiles([]);
      setNotifications([]);
    }
  }, [demoMode]);

  useEffect(() => {
    // Force synchronized transition
    document.documentElement.classList.add('theme-transition');
    
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Remove the class after the transition duration (300ms)
    const timeout = setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);

    return () => clearTimeout(timeout);
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Context Value for Navigation
  const navigateTo = (view: View, tab?: string) => {
    setView(view);
    if (tab && view === View.LEGAL) {
      setLegalTab(tab);
    }
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = { ...notif, id: Math.random().toString(36).substr(2, 9), timestamp: new Date(), read: false };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Combine Real and Demo Files
  const currentFiles = useMemo(() => {
    const allFiles = [...uploadedFiles, ...demoFiles];
    // Sort by Date (parsed from summary or created_at logic if available, defaulting to ID sort here for simplicity consistency)
    return allFiles.sort((a, b) => {
       // Try to sort by date in summary if available
       if (a.summary?.date && b.summary?.date) {
           const parse = (d: string) => {
               const p = d.split('/');
               return new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0])).getTime();
           };
           return parse(b.summary.date) - parse(a.summary.date);
       }
       return 0;
    });
  }, [uploadedFiles, demoFiles]);

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    
    if (notif.relatedId) {
      const invoice = currentFiles.find(f => f.id === notif.relatedId);
      if (invoice) {
        if (invoice.status === 'completed') {
          setSelectedInvoiceForReport(invoice);
        } else {
          setHighlightedFileId(notif.relatedId);
          setView(View.CONVERTER);
        }
      }
      setIsNotifOpen(false);
      setTimeout(() => setHighlightedFileId(null), 5000);
    }
  };

  const handleUpdateInvoicesStatus = async (ids: string[], newStatus: InvoiceStatus) => {
    // Optimistic Update for UI
    const updateList = (list: FileMetadata[]) => list.map(f => {
        if (ids.includes(f.id) && f.summary) {
            return { ...f, summary: { ...f.summary, paymentStatus: newStatus } };
        }
        return f;
    });

    if (demoMode) {
      setDemoFiles(prev => updateList(prev));
    } else {
      setUploadedFiles(prev => updateList(prev));
      
      // Persist to Supabase for Real Users
      // Find files to update from current state (before optimistic update, or find in updated list)
      // Using uploadedFiles (current state) is safe enough here as we filter by ID
      const filesToUpdate = uploadedFiles.filter(f => ids.includes(f.id));
      for (const file of filesToUpdate) {
          if (file.summary) {
              const updatedSummary = { ...file.summary, paymentStatus: newStatus };
              await supabase
                  .from('invoices')
                  .update({ summary: updatedSummary })
                  .eq('id', file.id);
          }
      }
    }

    addNotification({ 
      title: 'Mise à jour groupée', 
      description: `${ids.length} facture(s) passée(s) au statut ${statusLabels[newStatus] || newStatus}.`, 
      type: 'success' 
    });
  };

  const handleValidationSave = async (updated: FileMetadata) => {
    // Determine if it's a demo file or real file to update the correct state
    const isDemo = demoFiles.some(f => f.id === updated.id);
    
    if (isDemo) {
        setDemoFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
    } else {
        setUploadedFiles(prev => {
            const index = prev.findIndex(f => f.id === updated.id);
            if (index > -1) {
                const newList = [...prev];
                newList[index] = updated;
                return newList;
            }
            return [...prev, updated];
        });

        // Persist to Supabase
        await supabase
            .from('invoices')
            .update({ 
                name: updated.name,
                summary: updated.summary 
            })
            .eq('id', updated.id);
    }
    addNotification({ title: 'Données validées', description: `La facture ${updated.name} a été mise à jour manuellement.`, type: 'success' });
  };

  const handleOpenEditFromReport = (invoice: FileMetadata) => {
    setSelectedInvoiceForReport(null);
    setInvoiceToValidate(invoice);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    // 1. Optimistic UI update
    setCurrentUser(updatedUser);

    // 2. Persist to Supabase
    // We update the user_metadata which is the source of truth for this app's user profile
    const { error } = await supabase.auth.updateUser({
      data: {
        name: updatedUser.name,
        company: updatedUser.company,
        siret: updatedUser.siret,
        address: updatedUser.address,
        tva: updatedUser.tva
      }
    });

    if (error) {
       console.error("Error updating user:", error);
       addNotification({
        title: 'Erreur de sauvegarde',
        description: "Impossible d'enregistrer les modifications sur le serveur.",
        type: 'error'
      });
    } else {
      addNotification({
        title: 'Profil mis à jour',
        description: 'Vos informations personnelles ont été enregistrées avec succès.',
        type: 'success'
      });
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard demoMode={demoMode} invoices={currentFiles} isDark={isDark} onUpdateStatus={handleUpdateInvoicesStatus} onOpenReport={setSelectedInvoiceForReport} />;
      case View.CONVERTER: return (
        <Converter 
          setAppFiles={setUploadedFiles} // Note: This only sets real files. Demo files are read-only in this context regarding adding/deleting.
          appFiles={currentFiles} 
          isDemoMode={demoMode} 
          addNotification={addNotification} 
          highlightId={highlightedFileId}
          onOpenReport={setSelectedInvoiceForReport}
          onOpenValidation={setInvoiceToValidate}
        />
      );
      case View.AUDIT: return <ComplianceAudit files={currentFiles} addNotification={addNotification} />;
      case View.VAULT: return <Vault invoices={currentFiles} onOpenReport={setSelectedInvoiceForReport} />;
      case View.PRICING: return <Pricing />;
      case View.STRATEGY: return <ProjectStrategy />;
      case View.SETTINGS: return <Settings user={currentUser} onUpdateUser={handleUpdateUser} addNotification={addNotification} />;
      case View.LEGAL: return <LegalDocs initialTab={legalTab} addNotification={addNotification} currentUser={currentUser} />;
      default: return <Dashboard demoMode={demoMode} invoices={currentFiles} isDark={isDark} onUpdateStatus={handleUpdateInvoicesStatus} onOpenReport={setSelectedInvoiceForReport} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getUserAvatar = () => {
    if (currentUser?.avatarUrl) return currentUser.avatarUrl;
    return currentUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatarSeed}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
  };

  return (
    <NavigationContext.Provider value={{ navigateTo }}>
      <div className="flex h-screen bg-white dark:bg-slate-950 transition-colors text-slate-900 dark:text-slate-100 antialiased overflow-hidden font-sans">
        <Sidebar 
          currentView={currentView} 
          setView={setView} 
          isDark={isDark} 
          toggleTheme={() => setIsDark(!isDark)} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-transparent relative">
          <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-10 z-20">
            <div className="flex items-center gap-4">
              {/* Hamburger Button for Mobile */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>

              <div className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] hidden sm:block">
                <span className="text-blue-600">Factur-X</span> • <span className="text-slate-900 dark:text-white">{viewLabels[currentView]}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden md:flex items-center gap-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expérience Démo</span>
                <button 
                  onClick={() => setDemoMode(!demoMode)}
                  className={`relative w-14 h-7 rounded-full transition-all shadow-inner focus:outline-none ${demoMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md duration-500 ${demoMode ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
              
              {/* Chat Toggle for Mobile */}
              <button 
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="xl:hidden p-2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </button>

              <div className="relative" ref={notifRef}>
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-3 text-slate-400 hover:text-blue-600 relative transition-all focus:outline-none hover:scale-110 active:scale-90">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white dark:border-slate-900" />}
                </button>
                {isNotifOpen && <NotificationMenu notifications={notifications} onMarkAsRead={(id) => handleNotificationClick(notifications.find(n => n.id === id)!)} onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} />}
              </div>
              
              <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-10 h-10 rounded-2xl bg-slate-200 overflow-hidden border-2 border-white shadow-xl transition-transform duration-300 ease-out focus:outline-none transform-gpu"
                  title={currentUser ? "Mon Profil" : "Connexion / Inscription"}
              >
                  <img 
                      src={getUserAvatar()} 
                      alt="User" 
                      className="w-full h-full bg-white object-cover"
                  />
              </button>
            </div>
          </header>
          <main className="flex-1 min-h-0 overflow-hidden">{renderView()}</main>
        </div>
        
        <RightAISidebar 
          currentFiles={currentFiles} 
          isOpen={isRightSidebarOpen} 
          onClose={() => setIsRightSidebarOpen(false)} 
        />
        
        {/* Modals */}
        {selectedInvoiceForReport && (
          <ComplianceReportModal 
            invoice={selectedInvoiceForReport} 
            onClose={() => setSelectedInvoiceForReport(null)} 
            onEdit={() => handleOpenEditFromReport(selectedInvoiceForReport)}
          />
        )}
        {invoiceToValidate && (
          <ValidationModal 
            invoice={invoiceToValidate} 
            onClose={() => setInvoiceToValidate(null)} 
            onSave={handleValidationSave} 
          />
        )}
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogin={() => {}} // Handled by auth listener
          onLogout={() => {}} // Handled by auth listener
          onOpenSettings={() => setView(View.SETTINGS)}
        />
      </div>
    </NavigationContext.Provider>
  );
};

export default App;