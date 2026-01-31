import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import { Notification, User } from '../types';
import SupportTicketModal from './SupportTicketModal';
import { supabase } from '../lib/supabaseClient';

interface LegalDocsProps {
  initialTab?: string;
  addNotification?: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  currentUser?: User | null;
}

interface Ticket {
    id: string;
    ticket_ref: string;
    subject: string;
    status: 'open' | 'closed' | 'pending';
    created_at: string;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ initialTab = 'privacy', addNotification, currentUser }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
      const fetchTickets = async () => {
          if (activeTab === 'support' && currentUser) {
              setLoadingTickets(true);
              const { data, error } = await supabase
                  .from('tickets')
                  .select('id, ticket_ref, subject, status, created_at')
                  .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
                  .order('created_at', { ascending: false });
              
              if (!error && data) {
                  setUserTickets(data as Ticket[]);
              }
              setLoadingTickets(false);
          }
      };
      
      fetchTickets();
  }, [activeTab, currentUser, isTicketModalOpen]); // Reload when modal closes to see new ticket

  const sections = [
    {
      id: 'features',
      label: 'Fonctionnalités',
      content: `
# Fonctionnalités Factur-X Converter

## 🚀 Vue d'ensemble
Factur-X Converter est la solution SaaS ultime pour transformer vos processus de facturation. Notre plateforme allie intelligence artificielle et conformité légale pour automatiser le traitement de vos flux financiers.

### 1. Conversion Factur-X Native
Transformez n'importe quel PDF, JPG ou PNG en une **facture électronique hybride** (PDF/A-3 + XML) conforme à la norme EN 16931.
- Support des profils Basic, Basic WL, et EN 16931.
- Scellement numérique intégré.

### 2. Moteur IA & OCR
Notre moteur basé sur **Google Gemini** extrait plus de 40 points de données avec une précision >99%.
- Détection automatique des lignes de produits.
- Réconciliation TVA et Totaux.
- Identification intelligente des fournisseurs.

### 3. Coffre-fort Numérique
Archivage sécurisé à valeur probante pour une durée de 10 ans.
- Recherche "Full-text" dans vos factures.
- Filtres avancés (Date, Montant, Statut).
- Conformité RGPD totale.

### 4. API Rest
Intégrez notre technologie directement dans vos ERP, CRM ou outils comptables grâce à notre API documentée et performante.
      `
    },
    {
      id: 'api',
      label: 'Documentation API',
      content: `
# Documentation API (v1.0 Bêta)

## Introduction
L'API Factur-X Converter permet aux développeurs d'intégrer nos fonctionnalités de conversion et d'analyse directement dans leurs applications.

### Authentification
Toutes les requêtes doivent inclure un jeton Bearer dans l'en-tête \`Authorization\`.
\`\`\`bash
Authorization: Bearer sk_live_xxxxxxxx
\`\`\`

## Endpoints Principaux

### 📤 Upload & Analyse
**POST** \`/v1/invoices/analyze\`
Envoyez un fichier binaire (PDF/Image) pour extraire les données structurées.

**Réponse (JSON) :**
\`\`\`json
{
  "id": "inv_12345",
  "vendor": "Orange SA",
  "total_ttc": 45.00,
  "confidence": 0.98,
  "compliance_status": "valid"
}
\`\`\`

### 🏭 Conversion Factur-X
**POST** \`/v1/invoices/convert\`
Génère le fichier Factur-X (XML + PDF scellé).

**Body :**
\`\`\`json
{
  "invoice_id": "inv_12345",
  "profile": "en16931"
}
\`\`\`

### 📚 Documentation Complète
Pour accéder au Swagger UI et tester les endpoints, contactez notre équipe support pour obtenir une clé API Sandbox.
      `
    },
    {
      id: 'support',
      label: 'Support & Aide',
      content: `
# Centre de Support

## Nous contacter
Notre équipe est disponible pour vous accompagner dans la mise en place de la facturation électronique.

- **Chat Live** : Disponible 9h-18h (Lun-Ven) directement dans l'application.
- **Email** : support@factur-x-converter.io
- **Téléphone** : +33 1 00 00 00 00 (Clients Enterprise uniquement)

## SLA (Niveaux de Service)
| Plan | Temps de réponse garanti | Canal |
| :--- | :--- | :--- |
| **Indépendant** | 48h ouvrées | Email |
| **Cabinet / PME** | 4h ouvrées | Chat & Email |
| **Entreprise** | < 1h (24/7) | Téléphone dédié |

## FAQ Rapide
**Q : Mes données sont-elles sauvegardées ?**
R : Oui, nous effectuons des backups chiffrés toutes les 6 heures.

**Q : Puis-je exporter mes données ?**
R : Oui, un export CSV/XML complet est disponible à tout moment depuis le Dashboard.
      `
    },
    {
      id: 'privacy',
      label: 'Confidentialité',
      content: `
# Politique de Confidentialité

*Dernière mise à jour : 12 Octobre 2025*

## 1. Collecte des Données
Nous collectons uniquement les données nécessaires au bon fonctionnement du service :
- Informations de compte (Nom, Email, SIRET).
- Documents financiers (Factures, Avoirs) pour traitement.
- Logs de connexion pour sécurité.

## 2. Hébergement & Souveraineté
Vos données sont hébergées exclusivement au sein de l'Union Européenne (**Region AWS Frankfurt** via Supabase). Aucune donnée ne transite par des serveurs situés hors juridiction RGPD.

## 3. Usage de l'IA
Les documents soumis à notre IA (Google Gemini) sont traités de manière éphémère. **Vos données ne sont PAS utilisées pour entraîner les modèles publics de Google.** Un accord de confidentialité strict (DPA) couvre ces traitements.

## 4. Vos Droits
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données. Pour exercer ce droit, écrivez à dpo@factur-x-converter.io.
      `
    },
    {
      id: 'terms',
      label: 'CGV / CGU',
      content: `
# Conditions Générales d'Utilisation

## 1. Objet
Les présentes CGU régissent l'utilisation de la plateforme SaaS "Factur-X Converter". En créant un compte, vous acceptez ces conditions sans réserve.

## 2. Abonnement & Paiement
- Les abonnements sont mensuels ou annuels, renouvelables par tacite reconduction.
- Tout mois entamé est dû.
- Le paiement s'effectue par carte bancaire ou prélèvement SEPA (Stripe).

## 3. Responsabilité
Factur-X Converter met en œuvre tous les moyens pour assurer la disponibilité du service (obligation de moyens). Nous ne saurions être tenus responsables des pertes d'exploitation indirectes liées à une interruption de service ou une erreur d'extraction OCR, l'utilisateur restant seul responsable de la vérification comptable finale.

## 4. Résiliation
Vous pouvez résilier votre abonnement à tout moment depuis l'espace "Paramètres". La résiliation prend effet à la fin de la période de facturation en cours.
      `
    },
    {
      id: 'gdpr',
      label: 'Conformité RGPD',
      content: `
# Registre de Conformité RGPD

## Délégué à la Protection des Données (DPO)
Nous avons nommé un DPO externe chargé de veiller à la conformité de nos traitements.
Contact : dpo@factur-x-converter.io

## Sous-traitants ultérieurs
Voici la liste exhaustive de nos sous-traitants ayant accès à des données personnelles :

| Sous-traitant | Rôle | Localisation | Garanties |
| :--- | :--- | :--- | :--- |
| **Supabase** | Base de données & Auth | Allemagne (EU) | SCC / DPA signé |
| **Google Cloud** | Moteur IA (Vertex AI) | Belgique (EU) | Enterprise Agreement |
| **Stripe** | Paiements | Irlande (EU) | PCI-DSS Niveau 1 |

## Durée de conservation
- **Factures** : 10 ans (obligation légale).
- **Logs** : 1 an glissant.
- **Données compte après suppression** : 30 jours (backup), puis suppression définitive.
      `
    },
    {
      id: 'security',
      label: 'Audit & Sécurité',
      content: `
# Architecture de Sécurité

## Chiffrement
- **Au repos (At Rest)** : Toutes les données (Base de données et Stockage fichiers) sont chiffrées en AES-256.
- **En transit (In Transit)** : Toutes les communications utilisent TLS 1.3 (HTTPS).

## Authentification
Nous utilisons Supabase Auth, conforme aux standards de l'industrie.
- Mots de passe hashés (Argon2).
- Support MFA (Multi-Factor Authentication) disponible pour les plans Enterprise.

## Audits & Pentests
Un audit de sécurité est réalisé annuellement par un cabinet tiers certifié PASSI.
Dernier audit : **Septembre 2025** - Aucune vulnérabilité critique détectée.

## Plan de Reprise (PRA)
Nos données sont répliquées en temps réel sur une zone de disponibilité secondaire (AZ). En cas de panne majeure, notre RTO (Recovery Time Objective) est de 1 heure et notre RPO (Recovery Point Objective) est de 5 minutes.
      `
    }
  ];

  const activeDoc = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <div className="h-full overflow-y-auto w-full">
      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2 dark:text-white">Centre d'Information</h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Documentation légale, technique et support.</p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 mb-20">
          {/* Navigation Sidebar */}
          <nav className="w-full lg:w-64 flex-shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Navigation</div>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex-shrink-0 w-auto lg:w-full text-left px-5 py-3 rounded-xl transition-all text-xs font-bold whitespace-nowrap lg:whitespace-normal ${
                  activeTab === section.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
          
          {/* Content Area */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[600px] prose dark:prose-invert prose-slate prose-blue max-w-none transition-colors relative">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(activeDoc.content) }} />
            
            {/* Contextual Ticket Creation & List */}
            {activeTab === 'support' && addNotification && (
                <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 space-y-8">
                    {/* Create Ticket CTA */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-8 border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-black text-lg text-blue-900 dark:text-blue-100 mb-1">Besoin d'aide personnalisée ?</h4>
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 opacity-80">Nos experts techniques vous répondent directement.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsTicketModalOpen(true)}
                            className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            Ouvrir un ticket
                        </button>
                    </div>

                    {/* Tickets List */}
                    {currentUser && (
                        <div className="pt-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Vos tickets récents</h4>
                            
                            {loadingTickets ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-[10px] text-slate-400">Chargement...</p>
                                </div>
                            ) : userTickets.length > 0 ? (
                                <div className="space-y-3">
                                    {userTickets.map((ticket) => (
                                        <div key={ticket.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-bold font-mono text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{ticket.ticket_ref}</span>
                                                    <span className="text-sm font-black dark:text-white">{ticket.subject}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium pl-1">
                                                    Créé le {new Date(ticket.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                ticket.status === 'open' 
                                                ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30' 
                                                : ticket.status === 'closed'
                                                ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:border-slate-600'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {ticket.status === 'open' ? 'Ouvert' : ticket.status === 'closed' ? 'Fermé' : 'En cours'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-400 font-bold">Aucun ticket pour le moment.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
        
        <Footer />
        
        {/* Ticket Modal */}
        {addNotification && (
            <SupportTicketModal 
                isOpen={isTicketModalOpen} 
                onClose={() => setIsTicketModalOpen(false)} 
                addNotification={addNotification} 
            />
        )}
      </div>
    </div>
  );
};

// Helper to format simple markdown to HTML (reused from ProjectStrategy for consistency)
function formatMarkdown(text: string) {
  return text
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black mb-6 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-black mt-8 mb-4 dark:text-white text-blue-600">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-6 mb-3 dark:text-white">$1</h3>')
    .replace(/^\*\* (.*$)/gim, '<strong class="text-blue-600 dark:text-blue-400 font-black">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-100 font-black">$1</strong>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-600 dark:text-slate-400 mb-1 pl-2 marker:text-blue-500">$1</li>')
    .replace(/^`{3}(bash|json)?\n([\s\S]*?)\n`{3}/gm, '<div class="bg-slate-900 text-slate-50 p-4 rounded-xl font-mono text-xs my-4 overflow-x-auto shadow-inner border border-slate-700">$2</div>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono text-xs font-bold">$1</code>')
    .replace(/\| (.*) \|/g, (match) => {
       const cells = match.split('|').filter(c => c.trim().length > 0);
       // Simple table row detection (header vs body not perfectly distinguished in regex without lookbehind, assuming simple usage)
       const isHeader = match.includes('---');
       if (isHeader) return '';
       return `<div class="overflow-x-auto my-4"><table class="w-full min-w-[500px] border-collapse border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden"><tr class="bg-white dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">${cells.map(c => `<td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 last:border-0">${c.trim()}</td>`).join('')}</tr></table></div>`;
    })
    .replace(/\n/g, '<br />');
}

export default LegalDocs;