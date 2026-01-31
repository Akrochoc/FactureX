import React, { useState } from 'react';
import Footer from './Footer';

const ProjectStrategy: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const docs = [
    {
      title: "Business Plan (P&L)",
      content: `
# Business Model & Projections Financières

## 💰 Unit Economics (Rentabilité par Facture)
L'avantage concurrentiel majeur repose sur l'utilisation de modèles "Flash" pour l'OCR, réduisant drastiquement les coûts.

| Poste de Coût | Coût Unitaire (Est.) | Détails |
| :--- | :--- | :--- |
| **API Gemini 2.0 Flash** | 0.0004 € / facture | Basé sur 1M tokens input (images) |
| **Stockage (S3)** | 0.0002 € / facture | 5 ans de rétention PDF (Supabase) |
| **Bande Passante** | 0.0001 € / facture | Vercel Edge Network |
| **Total Coût Technique** | **~0.0007 €** | Marge brute théorique > 90% |

## 📈 Roadmap Financière (3 Ans)

### Phase 1 : Bootstrapping (Mois 1-6)
Objectif : Valider le PMF (Product Market Fit) avec 100 utilisateurs payants.
- **Utilisateurs** : 500 Gratuits / 50 Payants.
- **MRR (Revenu Mensuel)** : ~1 500 €.
- **Coûts Infra** : 50 € (Supabase Pro + Vercel Pro).
- **Coûts IA** : ~20 €.
- **Résultat** : Rentable techniquement, mais déficit dû au marketing (Ads).

### Phase 2 : Growth (Mois 6-18)
Objectif : Atteindre l'équilibre financier complet (Break-even).
- **Utilisateurs** : 2 000 Payants.
- **MRR** : ~60 000 €.
- **Coûts Infra** : 800 € (Scaling DB + Redis).
- **Coûts IA** : ~400 €.
- **Masse Salariale** : 45 000 € (3 Devs, 1 Sales, 1 Support).
- **Résultat Net** : ~10 000 € / mois.

### Phase 3 : Scale & Enterprise (Mois 18+)
Objectif : Devenir la référence des cabinets comptables.
- **Utilisateurs** : 10 000+ Payants.
- **MRR** : ~350 000 €.
- **Marge Nette Cible** : 40%.

## 🏷️ Stratégie de Pricing (ARPU Cible)

1.  **Freemium (Acquisition)** : 5 factures/mois. Coût pour nous : 0.01€/user/mois. (Outil marketing puissant).
2.  **Solo (19€/mois)** : Rentable dès la 1ère facture traitée.
3.  **Cabinet (49€/mois)** : Levier de marge le plus fort (volume).
4.  **API (Usage)** : Facturation au volume (0.10€ / facture) pour les ERP.
      `
    },
    {
      title: "Executive Summary",
      content: `
# Factur-X Converter: Vision & Roadmap

**Mission** : Simplifier la conformité à la facturation électronique 2026 pour les TPE/PME.

## Jalons Stratégiques (Milestones)
- **Phase 0 : Setup (S1-S3)** : Architecture Cloud, setup Document AI, Wireframes. (Budget: 5k€)
- **Phase 1 : MVP Technique (S4-S10)** : Moteur d'extraction IA fonctionnel (Objectif: 95% précision).
- **Phase 2 : MVP Produit (S11-S14)** : Dashboard, Chat IA Contextuel, Multi-upload.
- **Phase 3 : Prévente (Avant Sept 2026)** : Campagne Growth, Acquisition 500 premiers clients.
- **Phase 4 : Lancement Public (Sept 2026)** : Ouverture massive PPF/Chorus Pro.
      `
    },
    {
      title: "Cible & Personas",
      content: `
# Analyse de la Cible & Personas

## 🎯 Segmentation du Marché
Notre cœur de cible se situe sur le segment **TPE / PME (0 à 50 salariés)**, qui représente 99% des entreprises françaises et sera le plus impacté par la réforme de 2026.

| Segment | Volume Est. | Besoin Principal | Sensibilité Prix |
| :--- | :--- | :--- | :--- |
| **Solo / Freelance** | 1.2M | Conformité simple | Très Haute |
| **Artisans / TPE** | 3.5M | Gain de temps (Admin) | Haute |
| **Cabinets Comptables** | 20k | Productivité / Flux | Basse (ROI) |

## 👤 Nos Personas Prioritaires

### 1. Pierre, l'Artisan Pressé
- **Profil** : Plombier, 45 ans, 2 salariés.
- **Pain Point** : Perd ses factures papier, déteste l'administratif le soir et le weekend.
- **Usage** : Mobile-first. Il veut prendre une photo de sa facturette d'essence à la station-service.
- **Proposition de Valeur** : "Ton administratif réglé en 3 secondes depuis ton camion."

### 2. Sophie, la Freelance Tech
- **Profil** : UX Designer, 29 ans, Auto-entrepreneur.
- **Pain Point** : Angoisse du contrôle fiscal, peur de mal faire ses factures. Utilise déjà Notion/Slack.
- **Usage** : Desktop. Veut un outil "propre" qui s'intègre à son stack.
- **Proposition de Valeur** : "La conformité fiscale sans y penser, avec une UX digne de 2025."

### 3. Marc, l'Expert-Comptable (Prescripteur)
- **Profil** : Associé cabinet, 50 ans, gère 150 dossiers.
- **Pain Point** : Perd 30% de son temps à relancer les clients pour les justificatifs manquants ou illisibles.
- **Usage** : Batch processing. Veut un export direct vers Sage/Cegid.
- **Proposition de Valeur** : "Fini la chasse aux reçus. Recevez des flux XML propres et complets."

## ⚔️ Positionnement Concurrentiel
Contrairement aux ERP lourds (SAP, Cegid) ou aux néo-banques (Qonto, Shine) qui verrouillent l'écosystème :
- **Agnostique** : Fonctionne quelle que soit la banque.
- **Spécialisé** : Nous ne faisons que la conversion et l'archivage, mais nous le faisons mieux que tout le monde grâce à l'IA.
      `
    },
    {
      title: "Fonctionnalités & Forces",
      content: `
# Catalogue des Fonctionnalités & Atouts

## 🛠 Fonctionnalités Clés

### 1. Convertisseur Factur-X IA
**Objectif** : Automatiser la saisie comptable et la mise en conformité.
- **Analyse Sémantique** : Extraction intelligente via Google Gemini (OCR + Compréhension).
- **Génération XML** : Création de fichiers \`factur-x.xml\` conformes à la norme EN 16931.
- **Support Multi-formats** : Traitement des PDF, JPG et PNG.

### 2. Validation "Human-in-the-Loop"
**Objectif** : Garantir une fiabilité des données à 100%.
- **Interface Split-Screen** : Visualisation du document source à gauche, formulaire de correction à droite.
- **Contrôles Intelligents** : Alertes visuelles sur les champs manquants ou incohérents (TVA, Totaux).

### 3. Assistant Financier IA (Chat)
**Objectif** : Interagir naturellement avec la base documentaire.
- **Contexte Dynamique** : L'IA analyse les 20 dernières factures pour répondre aux questions ("Dépenses Uber ce mois-ci ?").
- **Suggestions** : Prompts pré-définis pour des analyses rapides.

### 4. Coffre-fort & Archivage
**Objectif** : Centraliser et sécuriser les documents.
- **Recherche Avancée** : Filtrage par fournisseur, date, statut ou montant.
- **Visualisation** : Aperçu instantané des documents avec indicateurs de conformité.

### 5. Tableau de Bord Décisionnel
**Objectif** : Piloter l'activité financière.
- **KPIs Temps Réel** : Suivi des encours, conformité moyenne, volume traité.
- **Graphiques Interactifs** : Répartition des dépenses par catégorie et top fournisseurs.

### 6. Sécurité & Anti-Fraude
**Objectif** : Prévenir les erreurs et malveillances.
- **Détection de Doublons** : Analyse avant import pour éviter les doubles paiements.
- **Audit SIRET/IBAN** : Vérification de la structure des identifiants légaux.
      `
    },
    {
      title: "Régulation IA (EU AI Act)",
      content: `
# Stratégie de Conformité EU AI Act

L'entrée en vigueur de l'**EU AI Act** transforme le paysage légal. Factur-X Converter adopte une approche **"Compliance-First"** pour rassurer les DAF et Experts-Comptables.

## 1. Classification & Transparence (Art. 50)
Nous utilisons des systèmes d'IA générative (General Purpose AI).
- **Transparence** : Tout contenu généré ou pré-rempli par l'IA est clairement identifié par des indicateurs visuels (✨).
- **Information** : Les utilisateurs sont informés que les scores de conformité proviennent d'un modèle probabiliste et ne remplacent pas un audit légal.

## 2. Supervision Humaine (Human-in-the-Loop)
Conformément à l'Article 14 sur la surveillance humaine :
- L'IA **ne prend jamais** de décision finale de paiement ou de scellement XML.
- Notre interface force une étape de **validation manuelle** où l'opérateur humain garde le contrôle final ("The human remains in command").
- Le mode "Split-Screen" permet de vérifier chaque hallucination potentielle du modèle.

## 3. Gouvernance des Données (Non-Training)
Nous utilisons l'API Google Vertex AI/Gemini en mode "Enterprise" avec des clauses de confidentialité strictes.
- **Zero Training** : Vos factures ne sont **JAMAIS** utilisées pour entraîner les modèles de base de Google.
- **Cloisonnement** : Les données de chaque client (Tenant) sont isolées logiquement via les Row Level Security (RLS) de Supabase.

## 4. Gestion des Risques & Biais
Bien que classé comme système à risque limité (gestion administrative), nous appliquons des standards élevés :
- **Tests de Robustesse** : Vérification continue du modèle sur des factures manuscrites ou dégradées.
- **Anti-Biais** : Surveillance des performances sur les factures étrangères pour éviter toute discrimination de traitement.

## 5. L'IA comme Auditeur Légal (Compliance Check)
Au-delà de sa propre conformité, notre solution utilise l'IA pour **garantir la légalité de vos factures** :
- **Vérification EN 16931** : L'IA analyse chaque document pour s'assurer qu'il contient toutes les mentions obligatoires exigées par la loi (TVA, SIRET, Dates).
- **Bouclier Fiscal** : Détection automatique des factures non-conformes avant archivage, réduisant le risque de redressement fiscal.
- **Conformité "By Design"** : Nous certifions que chaque fichier XML généré respecte strictement les standards européens.
      `
    },
    {
      title: "Organisation & Rôles",
      content: `
# Matrice des Responsabilités (RACI)

| Rôle | Responsable | Mission Critique |
| :--- | :--- | :--- |
| **Product Manager** | Membre 1 | Roadmap, Conformité Légale EN 16931 |
| **Growth & Sales** | Membre 2 | Funnel AARRR, CAC < 25€ |
| **Creative Content** | Membre 3 | Vidéos Tutoriels, Ads LinkedIn |
| **UI/UX Design** | Membre 4 | App Design, Retention Rate > 40% |

## Objectifs Hebdomadaires
- **Stand-up** : 09:30 - 09:45 (Tous les jours)
- **Sprint Review** : Vendredi 16:00
- **Focus IA** : 12h/semaine dédiées au fine-tuning du moteur OCR.
      `
    },
    {
      title: "Backlog Technique",
      content: `
# Priorisation MoSCoW

- **MUST (Immédiat)** : Multi-upload (20+ fichiers), OCR IA, Génération XML Factur-X.
- **SHOULD (Phase 2)** : Dashboard Analytics, Assistant Chat Gemini, Anti-fraude SIRET.
- **COULD (Phase 3)** : Intégration Zapier, Export Sage/QuickBooks, Workflow multi-utilisateurs.
- **WON'T (V1)** : Application Mobile Desktop.

## Performance Tech Cible
- **Temps d'extraction** : < 3 secondes par page.
- **Taux de rejet PPF** : < 0.1% attendu.
- **Disponibilité (SLA)** : 99.9%.
      `
    },
    {
      title: "Go-To-Market",
      content: `
# Stratégie d'Acquisition

## Funnel Conversion
1. **Awareness** : Campagne LinkedIn "Réforme 2026 : Le Guide".
2. **Acquisition** : 5 factures gratuites / mois.
3. **Activation** : Premier PDF scellé téléchargé.
4. **Retention** : Relance automatique des échéances de paiement.

## Personas Cibles
- **Artisan (40%)** : Besoin de simplicité, usage mobile photo.
- **Freelance (30%)** : Faible volume, besoin de stockage légal 10 ans.
- **Expert-Comptable (30%)** : Multi-dossiers, automatisation exports.
      `
    },
    {
      title: "Analyse des Risques",
      content: `
# Matrice de Criticité & Conformité

| Risque | Impact | Probabilité | Mitigation |
| :--- | :--- | :--- | :--- |
| **Non-Conformité RGPD** | Critique | Moyenne | Hébergement **Supabase EU (Frankfurt)** obligatoire. |
| Précision OCR basse | Critique | Moyenne | Validation Human-in-the-loop |
| Report Réforme | Majeur | Haute | Pivot sur Gestion de Trésorerie |
| Coût API Document AI | Moyen | Faible | Optimisation des quotas et cache |
| Concurrence Bancaire | Majeur | Moyenne | Ultra-spécialisation IA & UX |

## Souveraineté des Données
- **Hébergement** : Toutes les données clients (PDFs, embeddings vectoriels, base de données) sont hébergées sur la région AWS **eu-central-1** (Frankfurt) via Supabase.
- **Conformité** : Respect total du RGPD et des normes de facturation électronique (eIDAS).
      `
    }
  ];

  return (
    <div className="h-full overflow-y-auto w-full">
      <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2 dark:text-white">Stratégie & Organisation</h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Vision chiffrée et planification opérationnelle du projet.</p>
          </div>
          <div className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-blue-100">Interne Équipe</div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-20">
          <nav className="w-full lg:w-72 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            {docs.map((doc, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex-shrink-0 w-auto lg:w-full text-left px-6 py-4 rounded-[1.5rem] transition-all text-xs font-black uppercase tracking-widest border whitespace-nowrap lg:whitespace-normal ${
                  activeTab === i 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800'
                }`}
              >
                {doc.title}
              </button>
            ))}
          </nav>
          
          <div className="flex-1 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[600px] prose dark:prose-invert prose-slate prose-blue max-w-none transition-colors">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(docs[activeTab].content) }} />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

function formatMarkdown(text: string) {
  return text
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl md:text-3xl font-black mb-8 dark:text-white">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg md:text-xl font-black mt-10 mb-6 dark:text-white border-l-4 border-blue-600 pl-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-base md:text-lg font-black mt-8 mb-4 dark:text-white">$1</h3>')
    .replace(/^\*\* (.*$)/gim, '<strong class="text-blue-600 dark:text-blue-400 font-black">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-100 font-black">$1</strong>')
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc text-slate-600 dark:text-slate-400 mb-2">$1</li>')
    .replace(/\| (.*) \|/g, (match) => {
       const cells = match.split('|').filter(c => c.trim().length > 0);
       return `<div class="overflow-x-auto my-6"><table class="w-full min-w-[500px] border-collapse border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden"><tr class="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-500">${cells.map(c => `<th class="px-4 py-3 border border-slate-100 dark:border-slate-800">${c.trim()}</th>`).join('')}</tr></table></div>`;
    })
    .replace(/\n/g, '<br />');
}

export default ProjectStrategy;