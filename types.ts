
export enum View {
  DASHBOARD = 'DASHBOARD',
  CONVERTER = 'CONVERTER',
  AUDIT = 'AUDIT',
  VAULT = 'VAULT',
  PRICING = 'PRICING',
  STRATEGY = 'STRATEGY',
  SETTINGS = 'SETTINGS',
  LEGAL = 'LEGAL'
}

export type InvoiceStatus = 'draft' | 'to_validate' | 'validated' | 'paid';

export interface FraudCheck {
  siretValid: boolean;
  ibanTrusted: boolean;
  isDuplicate: boolean;
  score: number; // 0 to 100, 100 is safe
}

export interface InvoiceSummary {
  vendor: string;
  date: string;
  totalTTC: string;
  tax: string;
  siret: string;
  iban?: string;
  category: string;
  compliance: number; // Percentage
  missingElements?: string[];
  fraudCheck?: FraudCheck;
  paymentStatus: InvoiceStatus;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  preview?: string;
  summary?: InvoiceSummary;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  relatedId?: string;
}

export interface User {
  name: string;
  email: string;
  company: string;
  siret: string;
  address?: string;
  tva?: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro' | 'enterprise';
  avatarSeed: string;
  avatarUrl?: string;
}