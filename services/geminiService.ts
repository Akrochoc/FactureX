
import { GoogleGenAI, Type } from "@google/genai";

// Helper to safely get the API Key in various environments (Vite vs Node)
export const getApiKey = (): string | undefined => {
  // 1. Try Vite standard method (Required for Vercel/Vite frontend)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  // 2. Fallback for Node.js / Webpack
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  return undefined;
};

const getAIClient = () => {
  const apiKey = getApiKey();
  
  // CRITICAL FIX: The GoogleGenAI constructor throws if apiKey is undefined or empty.
  // We provide a dummy key 'MISSING_KEY' to allow the app to load.
  // The actual API call will fail gracefully later with a 400 error, which we catch.
  if (!apiKey) {
    console.warn("API Key missing. Using placeholder to prevent crash.");
    return new GoogleGenAI({ apiKey: 'MISSING_KEY_PLACEHOLDER' });
  }
  
  return new GoogleGenAI({ apiKey });
};

export async function chatWithGemini(prompt: string, history: { role: 'user' | 'model', text: string }[], context?: string) {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })),
    config: {
      systemInstruction: `Tu es l'assistant IA expert de 'Factur-X Converter'. 
      Ton rôle est d'aider les utilisateurs à comprendre leurs factures et conformité Factur-X.
      
      RÈGLES DE FORMATAGE CRITIQUES :
      1. Utilise des **mots en gras** pour les montants, les noms de fournisseurs et les dates.
      2. Utilise des listes à puces (avec -) pour énumérer plusieurs éléments ou statistiques.
      3. Aère tes réponses avec des sauts de ligne.
      4. Sois très structuré : Titre, Liste, Conclusion.
      
      CONTEXTE DES FACTURES ACTUELLES :
      ${context || 'Aucune facture chargée.'}
      
      Réponds de manière concise, professionnelle et ultra-lisible.`,
    },
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text;
}

export async function analyzeInvoiceImage(base64Data: string, mimeType: string) {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Analyse ce document (facture). Extraits les champs demandés avec précision. Si le document n'est pas une facture, indique une conformité de 0." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendor: { type: Type.STRING, description: "Nom de l'émetteur ou fournisseur" },
            date: { type: Type.STRING, description: "Date d'émission au format JJ/MM/AAAA" },
            totalTTC: { type: Type.STRING, description: "Montant total TTC avec le symbole devise (ex: 20.00 €)" },
            tax: { type: Type.STRING, description: "Montant total de la TVA avec devise" },
            siret: { type: Type.STRING, description: "Numéro SIRET (14 chiffres) si présent" },
            iban: { type: Type.STRING, description: "IBAN complet si présent" },
            category: { type: Type.STRING, description: "Catégorie suggérée (Énergie, Télécom, Services, Déplacements, etc.)" },
            compliance: { type: Type.NUMBER, description: "Score de fiabilité/conformité estimé sur 100" }
          }
        }
      }
    });
    return response.text;
  } catch (error: any) {
    // Catch the specific error when using the dummy key
    if (error.message?.includes('API key not valid') || error.toString().includes('400')) {
       throw new Error("Clé API invalide ou manquante (VITE_API_KEY).");
    }
    throw error;
  }
}

export async function auditInvoiceCompliance(base64Data: string, mimeType: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: `
          Agis comme un auditeur expert en conformité fiscale européenne et en IA Responsable (EU AI Act).
          Analyse ce document pour vérifier sa conformité stricte.
          
          Vérifie les 4 piliers :
          1. Conformité Fiscale (EN 16931) : Présence SIRET, TVA, Date, Totaux, Mentions légales.
          2. Qualité des Données : Lisibilité, absence d'ambiguïté sur les montants.
          3. Protection des Données (RGPD) : Présence de données sensibles non nécessaires.
          4. Authenticité : Signes de manipulation ou d'incohérence visuelle.

          Retourne un JSON strict.
        ` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          globalScore: { type: Type.NUMBER, description: "Score global sur 100" },
          riskLevel: { type: Type.STRING, enum: ["Faible", "Moyen", "Critique"], description: "Niveau de risque légal" },
          fiscalCheck: { 
             type: Type.OBJECT,
             properties: {
                status: { type: Type.BOOLEAN },
                details: { type: Type.STRING, description: "Court commentaire sur la conformité fiscale (EN 16931)" }
             }
          },
          dataQualityCheck: { 
             type: Type.OBJECT,
             properties: {
                status: { type: Type.BOOLEAN },
                details: { type: Type.STRING, description: "Court commentaire sur la lisibilité et qualité" }
             }
          },
          gdprCheck: { 
             type: Type.OBJECT,
             properties: {
                status: { type: Type.BOOLEAN },
                details: { type: Type.STRING, description: "Court commentaire sur les données personnelles (PII)" }
             }
          },
          recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liste de 3 recommandations précises pour améliorer la conformité"
          }
        }
      }
    }
  });
  return response.text;
}
