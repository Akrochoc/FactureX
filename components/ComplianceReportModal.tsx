
import React from 'react';
import { FileMetadata } from '../types';
import DocumentPreview from './DocumentPreview';

interface ComplianceReportModalProps {
  invoice: FileMetadata;
  onClose: () => void;
  onEdit: () => void;
}

// Minimal Factur-X XML Generator (Basic profile equivalent)
const generateFacturXXML = (invoice: FileMetadata) => {
  const summary = invoice.summary;
  if (!summary) return '';

  const cleanAmount = (amt: string | undefined) => amt ? amt.replace(/[^\d.,]/g, '').replace(',', '.') : '0.00';
  const amountTotal = cleanAmount(summary.totalTTC);
  const amountTax = cleanAmount(summary.tax);
  const amountHT = (parseFloat(amountTotal) - parseFloat(amountTax)).toFixed(2);
  const now = new Date().toISOString();
  
  // Basic XML Template mimicking Factur-X Minimum profile
  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${invoice.id.split('-')[1] || 'INV001'}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${summary.date ? summary.date.replace(/\//g, '') : '20260101'}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${summary.vendor}</ram:Name>
        <ram:SpecifiedLegalOrganization>
           <ram:ID schemeID="0009">${summary.siret || '00000000000000'}</ram:ID>
        </ram:SpecifiedLegalOrganization>
      </ram:SellerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery />
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
         <ram:PayeePartyCreditorFinancialAccount>
            <ram:IBANID>${summary.iban || ''}</ram:IBANID>
         </ram:PayeePartyCreditorFinancialAccount>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${amountHT}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${amountHT}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${amountTax}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount currencyID="EUR">${amountTotal}</ram:GrandTotalAmount>
        <ram:DuePayableAmount currencyID="EUR">${amountTotal}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
};

const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({ invoice, onClose, onEdit }) => {
  const compliance = invoice.summary?.compliance || 0;
  const isPerfect = compliance === 100;
  const isCritical = compliance < 60;
  const hasAnomalies = compliance < 100;

  // Helper for compliance colors
  const getScoreColor = () => {
    if (isPerfect) return 'text-green-500';
    if (isCritical) return 'text-red-500';
    return 'text-amber-500';
  };
  
  const getScoreLabelColor = () => {
    if (isPerfect) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (isCritical) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
  };

  const getHeaderIcon = () => {
      if (isPerfect) {
          return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      }
      return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
  };

  const handleDownloadXML = () => {
      const xmlContent = generateFacturXXML(invoice);
      const blob = new Blob([xmlContent], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factur-x_${invoice.name.replace(/\.[^/.]+$/, "")}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Helper to safely render fields that might be null/missing
  const renderField = (value?: string | null) => {
    if (!value || value === 'null' || value === 'Non détecté' || value === 'NON DÉTECTÉ') {
        return <span className="text-slate-400 italic text-[11px] font-normal">Non détecté</span>;
    }
    return value;
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-2xl border overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ${
            isPerfect ? 'border-green-500/20 shadow-green-500/10' : 
            isCritical ? 'border-red-500/20 shadow-red-500/10' : 
            'border-amber-500/20 shadow-amber-500/10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`p-3 rounded-2xl ${
                isPerfect ? 'bg-green-100 text-green-600' : 
                isCritical ? 'bg-red-100 text-red-600' : 
                'bg-amber-100 text-amber-600'
            } shadow-inner shrink-0`}>
              {getHeaderIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg md:text-xl font-black dark:text-white truncate max-w-[200px] md:max-w-[300px]">{invoice.name}</h3>
                <button 
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all text-slate-500 shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Modifier
                </button>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {invoice.id.split('-')[1]?.toUpperCase() || invoice.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none shrink-0"
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 md:p-10 overflow-y-auto max-h-[70vh]">
          {/* Main Layout: Preview (Left) - Info & Score (Right) */}
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            {/* Left: Preview (Image or PDF) */}
            <div className={`w-full md:w-48 h-64 shrink-0 rounded-[2rem] overflow-hidden border-4 shadow-2xl relative bg-slate-100 dark:bg-slate-800 group ${
                isPerfect ? 'border-green-500/20' : 
                isCritical ? 'border-red-500/20' : 
                'border-amber-500/20'
            }`}>
              {/* Eye Button */}
              {invoice.preview && (
                  <a 
                    href={invoice.preview} 
                    target="_blank" 
                    rel="noreferrer"
                    title="Ouvrir le document original"
                    className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 text-slate-500 hover:text-blue-600 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 transition-all hover:scale-110"
                  >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </a>
              )}

              <DocumentPreview src={invoice.preview} type={invoice.type} className="w-full h-full" />
            </div>

            {/* Right: Info */}
            <div className="flex-1 flex flex-col justify-between gap-6 md:gap-0">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                 <div className="min-w-0">
                    <h4 className="text-2xl md:text-3xl font-black dark:text-white uppercase tracking-tighter leading-none mb-2 break-words">{invoice.summary?.vendor}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                          {invoice.summary?.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {invoice.summary?.date}
                        </span>
                    </div>
                 </div>
                 
                 {/* Score On The Side */}
                 <div className="flex flex-col items-end shrink-0">
                    <div className={`text-5xl md:text-6xl font-black tracking-tighter leading-none ${getScoreColor()}`}>
                       {compliance}
                       <span className="text-2xl align-top opacity-50">%</span>
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg mt-1 ${getScoreLabelColor()}`}>
                       {isPerfect ? 'Conformité Totale' : 'Anomalies'}
                    </div>
                 </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Montant Total</p>
                    <p className={`font-black text-lg md:text-xl dark:text-white ${isCritical ? 'text-red-500' : 'text-slate-900'}`}>{invoice.summary?.totalTTC}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">TVA Déductible</p>
                    <p className="font-bold text-sm dark:text-white">{invoice.summary?.tax}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">SIRET</p>
                    <p className="font-mono font-bold text-sm dark:text-white truncate">{renderField(invoice.summary?.siret)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">IBAN</p>
                    <p className="font-mono font-bold text-sm dark:text-white truncate" title={invoice.summary?.iban || ''}>{renderField(invoice.summary?.iban)}</p>
                  </div>
              </div>
            </div>
          </div>

          {/* Anomalies Section - Only show if there are actual anomalies */}
          {hasAnomalies && invoice.summary?.missingElements && invoice.summary.missingElements.length > 0 && (
            <div className={`mb-10 p-8 rounded-[2rem] border-2 shadow-inner ${
              isCritical 
                ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' 
                : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'
            }`}>
              <div className={`flex items-center gap-3 mb-4 ${isCritical ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h5 className="font-black uppercase tracking-widest text-sm">
                  {isCritical ? 'Alerte Conformité Critique' : 'Anomalies détectées'}
                </h5>
              </div>
              <ul className="space-y-3">
                {invoice.summary.missingElements.map((error, idx) => (
                  <li key={idx} className={`text-xs font-bold flex items-start gap-3 ${isCritical ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isCritical ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                    <span className="break-words">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isPerfect && (
             <div className="mb-10 p-8 rounded-[2rem] border-2 border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10 shadow-inner">
                <div className="flex items-center gap-3 mb-2 text-green-700 dark:text-green-400">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <h5 className="font-black uppercase tracking-widest text-sm">Rien à signaler</h5>
                </div>
                <p className="text-xs font-bold text-green-800 dark:text-green-300 pl-9">
                   Conformité parfaite. Toutes les mentions obligatoires Factur-X sont présentes.
                </p>
             </div>
          )}

          <div className="space-y-6">
            <h5 className="font-black uppercase tracking-widest text-xs dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-400">Certifications & Validations</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400">Scellage Numérique</span>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md border border-green-100 dark:border-green-900/50">CERTIFIÉ</span>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400">Rétention Légale</span>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/50">10 ANS</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row gap-5 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleDownloadXML}
            className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 ${
              isCritical ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
            }`}
          >
            Télécharger Factur-X (XML)
          </button>
          <button className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            Export ERP / FEC
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReportModal;
