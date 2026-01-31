import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { FileMetadata, InvoiceStatus } from '../types';
import Footer from './Footer';

interface DashboardProps {
  demoMode: boolean;
  invoices: FileMetadata[];
  isDark: boolean;
  onUpdateStatus?: (ids: string[], newStatus: InvoiceStatus) => void;
  onOpenReport?: (invoice: FileMetadata) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6'];

const parseDateStr = (d: string) => {
  const parts = d.split('/');
  if (parts.length !== 3) return 0;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
};

// Robust amount parsing
const parseAmount = (val: string) => {
  if (!val) return 0;
  let clean = val.replace(/\s/g, '').replace(/[^\d,.-]/g, '');
  clean = clean.replace(',', '.');
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = parts.slice(0, -1).join('') + '.' + parts.slice(-1);
  }
  const result = parseFloat(clean);
  return isNaN(result) ? 0 : result;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const name = item.name || label;
    const value = typeof item.value === 'number' 
      ? item.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) 
      : item.value;

    return (
      <div className="bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-200 transition-all duration-300">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{name}</p>
        <p className="text-lg font-black tracking-tight">{value}</p>
      </div>
    );
  }
  return null;
};

const EmptyStateGraph = ({ message }: { message: string }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{message}</p>
  </div>
);

type SortKey = 'name' | 'vendor' | 'date' | 'total';
type SortOrder = 'asc' | 'desc';
type DateFilter = 'all' | 'month' | 'quarter' | 'calendar';

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  to_validate: 'À valider',
  validated: 'Validé',
  paid: 'Payé'
};

const Dashboard: React.FC<DashboardProps> = ({ invoices, isDark, onUpdateStatus, onOpenReport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  
  // Calendar View State
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  // Replace single day selection with Range selection
  const [calendarSelection, setCalendarSelection] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const [columnFilters, setColumnFilters] = useState({
    id: '',
    vendor: '',
    status: 'all' as InvoiceStatus | 'all',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'date',
    order: 'desc'
  });

  // Handle click outside for filters and search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterMenuOpen) setIsFilterMenuOpen(null);
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isFilterMenuOpen]);

  // Helper for inputs
  const toInputDate = (d: Date | null) => {
      if (!d) return '';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  const parseInputDate = (s: string) => {
      if (!s) return null;
      const p = s.split('-');
      return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
  };

  // Initial filtering: Status Completed + Date Range
  const completed = useMemo(() => {
    let base = invoices.filter(i => i.status === 'completed' && i.summary);
    
    // Date Filtering
    const now = new Date();
    if (dateFilter === 'month') {
        base = base.filter(i => {
            if (!i.summary?.date) return false;
            const d = new Date(parseDateStr(i.summary.date));
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    } else if (dateFilter === 'quarter') {
        const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
        base = base.filter(i => {
            if (!i.summary?.date) return false;
            const d = new Date(parseDateStr(i.summary.date));
            const dQuarter = Math.floor((d.getMonth() + 3) / 3);
            return dQuarter === currentQuarter && d.getFullYear() === now.getFullYear();
        });
    } else if (dateFilter === 'calendar') {
        const targetYear = calendarViewDate.getFullYear();
        const targetMonth = calendarViewDate.getMonth();
        
        base = base.filter(i => {
            if (!i.summary?.date) return false;
            const d = parseDateStr(i.summary.date); // timestamp

            // If a calendar selection exists (Start date at minimum)
            if (calendarSelection.start) {
                const startTs = new Date(calendarSelection.start).setHours(0,0,0,0);
                let endTs;
                if (calendarSelection.end) {
                     endTs = new Date(calendarSelection.end).setHours(23,59,59,999);
                } else {
                     // Single day selection
                     endTs = new Date(calendarSelection.start).setHours(23,59,59,999);
                }
                return d >= startTs && d <= endTs;
            }

            // Fallback: View entire month if no selection
            const dDate = new Date(d);
            return dDate.getFullYear() === targetYear && dDate.getMonth() === targetMonth;
        });
    }

    return base;
  }, [invoices, dateFilter, calendarViewDate, calendarSelection]);

  const uniqueVendors = useMemo(() => {
    const vendors = new Set(completed.map(i => i.summary?.vendor).filter(Boolean) as string[]);
    return Array.from(vendors).sort();
  }, [completed]);

  const getVendorCategory = (vendorName: string) => {
    const invoice = completed.find(i => i.summary?.vendor === vendorName);
    return invoice?.summary?.category || 'Autres';
  };

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return uniqueVendors.slice(0, 20);
    const lowerQuery = searchQuery.toLowerCase();
    return uniqueVendors.filter(v => v.toLowerCase().includes(lowerQuery));
  }, [uniqueVendors, searchQuery]);

  const stats = useMemo(() => {
    const totalVal = completed.reduce((acc, curr) => acc + parseAmount(curr.summary?.totalTTC || '0'), 0);
    const toValidate = completed.filter(i => i.summary?.paymentStatus === 'to_validate').length;
    const paidCount = completed.filter(i => i.summary?.paymentStatus === 'paid').length;
    const avgCompliance = completed.length > 0 ? (completed.reduce((acc, curr) => acc + (curr.summary?.compliance || 0), 0) / completed.length).toFixed(1) : 0;

    const cats: Record<string, number> = {};
    completed.forEach(inv => {
      const c = inv.summary?.category || 'Autres';
      const amount = parseAmount(inv.summary?.totalTTC || '0');
      cats[c] = (cats[c] || 0) + amount;
    });
    const pieData = Object.entries(cats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const vendors: Record<string, number> = {};
    completed.forEach(inv => {
        let vRaw = inv.summary?.vendor;
        if (!vRaw || vRaw.trim().length === 0) vRaw = 'Fournisseur Inconnu';
        const vKey = vRaw.trim(); 
        const amount = parseAmount(inv.summary?.totalTTC || '0');
        vendors[vKey] = (vendors[vKey] || 0) + amount;
    });

    const barData = Object.entries(vendors)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);

    return { totalVal, toValidate, paidCount, avgCompliance, pieData, barData };
  }, [completed]);

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredInvoices = useMemo(() => {
    let result = [...completed];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv => 
        inv.name.toLowerCase().includes(q) || 
        (inv.summary?.vendor && inv.summary.vendor.toLowerCase().includes(q)) ||
        inv.summary?.totalTTC.toLowerCase().includes(q)
      );
    }

    if (columnFilters.id) result = result.filter(inv => inv.name.toLowerCase().includes(columnFilters.id.toLowerCase()));
    if (columnFilters.vendor) result = result.filter(inv => inv.summary?.vendor && inv.summary.vendor.toLowerCase().includes(columnFilters.vendor.toLowerCase()));
    if (columnFilters.status !== 'all') result = result.filter(inv => inv.summary?.paymentStatus === columnFilters.status);

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'vendor': comparison = (a.summary?.vendor || '').localeCompare(b.summary?.vendor || ''); break;
        case 'date': comparison = parseDateStr(a.summary!.date) - parseDateStr(b.summary!.date); break;
        case 'total': comparison = parseAmount(a.summary!.totalTTC) - parseAmount(b.summary!.totalTTC); break;
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [completed, searchQuery, columnFilters, sortConfig]);

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    // Initialize calendar view to today if calendar is selected, reset selection
    if (filter === 'calendar') {
        setCalendarViewDate(new Date());
        setCalendarSelection({ start: null, end: null });
    }
  };

  const resetCalendar = () => {
    setCalendarSelection({ start: null, end: null });
    setCalendarViewDate(new Date());
  };

  const handlePrevMonth = () => {
    setCalendarViewDate(prev => {
        const d = new Date(prev);
        d.setDate(1); // Set to first of month to avoid overflow on days like 31st
        d.setMonth(d.getMonth() - 1);
        return d;
    });
  };

  const handleNextMonth = () => {
    setCalendarViewDate(prev => {
        const d = new Date(prev);
        d.setDate(1);
        d.setMonth(d.getMonth() + 1);
        return d;
    });
  };

  const handleExportCSV = () => {
    if (selectedIds.length === 0) return;
    const invoicesToExport = completed.filter(inv => selectedIds.includes(inv.id));
    const headers = ['ID', 'Nom Fichier', 'Fournisseur', 'Date', 'Catégorie', 'Montant TTC', 'TVA', 'Statut', 'SIRET', 'Conformité'];
    const rows = invoicesToExport.map(inv => [
        inv.id, `"${inv.name.replace(/"/g, '""')}"`, `"${inv.summary?.vendor || ''}"`,
        inv.summary?.date || '', inv.summary?.category || '', `"${inv.summary?.totalTTC || ''}"`,
        `"${inv.summary?.tax || ''}"`, statusLabels[inv.summary?.paymentStatus || 'draft'],
        `"${inv.summary?.siret || ''}"`, `${inv.summary?.compliance || 0}%`
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `export_factur-x_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) setSelectedIds([]);
    else setSelectedIds(filteredInvoices.map(inv => inv.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatusUpdate = (status: InvoiceStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(selectedIds, status);
      setSelectedIds([]);
    }
  };

  // Calendar Logic
  const generateCalendarDays = () => {
      const year = calendarViewDate.getFullYear();
      const month = calendarViewDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Adjust for Monday start (FR locale)
      // 0(Sun) -> 6, 1(Mon) -> 0
      const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
      
      const days = [];
      for (let i = 0; i < startOffset; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);
      return days;
  };

  const hasInvoicesOnDay = (day: number) => {
      const targetYear = calendarViewDate.getFullYear();
      const targetMonth = calendarViewDate.getMonth();
      return invoices.some(i => {
          if (i.status !== 'completed' || !i.summary?.date) return false;
          const d = new Date(parseDateStr(i.summary.date));
          return d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() === day;
      });
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const handleCalendarDayClick = (day: number) => {
      const clickedDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
      
      // 1. If nothing selected or both selected -> Start new selection
      if (!calendarSelection.start || (calendarSelection.start && calendarSelection.end)) {
          setCalendarSelection({ start: clickedDate, end: null });
      } else {
          // 2. We have a start but no end
          if (clickedDate.getTime() < calendarSelection.start.getTime()) {
              // Clicked before start -> Reset start to this new date
              setCalendarSelection({ start: clickedDate, end: null });
          } else {
              // Valid range
              setCalendarSelection({ ...calendarSelection, end: clickedDate });
          }
      }
  };

  const renderVendorIcon = (vendor: string) => {
    const category = getVendorCategory(vendor).toLowerCase();
    const vName = vendor.toLowerCase();
    if (vName.includes('inconnu') || vName.includes('unknown')) return <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (category.includes('eau') || category.includes('water') || vName.includes('suez') || vName.includes('veolia') || vName.includes('saur')) return <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22C17.5 22 22 17.5 22 12C22 6.5 12 2 12 2C12 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" /></svg>;
    if (category.includes('énergie') || category.includes('energy') || vName.includes('edf') || vName.includes('total') || vName.includes('engie')) return <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    if (category.includes('télécom') || category.includes('internet') || vName.includes('orange') || vName.includes('sfr') || vName.includes('bouygues')) return <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
    if (category.includes('cloud') || category.includes('logiciel') || category.includes('it') || vName.includes('aws') || vName.includes('google') || vName.includes('adobe') || vName.includes('microsoft')) return <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
    if (category.includes('déplacement') || category.includes('transport') || vName.includes('uber') || vName.includes('sncf') || vName.includes('total') || vName.includes('shell') || vName.includes('bip&go')) return <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    if (category.includes('services') || category.includes('consulting')) return <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    return <svg className="w-4 h-4 text-slate-300 group-hover/item:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <svg className="w-6 h-6 text-slate-300 dark:text-slate-600 opacity-40 group-hover/sort:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
    return sortConfig.order === 'asc' 
      ? <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
      : <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>;
  };

  const FilterIcon = ({ active }: { active: boolean }) => (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );

  return (
    <div className="h-full overflow-y-auto w-full custom-scrollbar">
      <div className="p-4 md:p-10 max-w-7xl mx-auto pb-32">
        <header className="mb-8 md:mb-12 flex flex-col lg:flex-row justify-between items-start gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black dark:text-white text-blue-600 tracking-tight">Tableau <span className="text-slate-900 dark:text-slate-100">Bord Interactif</span></h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 opacity-60">Gestion granulaire et actions groupées</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             {/* Date Filter */}
             <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 relative">
                <button 
                  onClick={() => handleDateFilterChange('all')}
                  className={`px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === 'all' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Tout
                </button>
                <button 
                  onClick={() => handleDateFilterChange('quarter')}
                  className={`px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === 'quarter' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Trimestre
                </button>
                <button 
                  onClick={() => handleDateFilterChange('month')}
                  className={`px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === 'month' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Ce Mois
                </button>
                <button 
                  onClick={() => handleDateFilterChange('calendar')}
                  className={`px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === 'calendar' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Calendrier
                </button>

                {/* Calendar View Popover */}
                {dateFilter === 'calendar' && (
                   <div className="absolute top-full right-0 mt-3 p-5 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 z-50 w-[340px] animate-in fade-in slide-in-from-top-2">
                       <div className="flex items-center gap-2 mb-4">
                           <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                           </button>
                           
                           <div className="flex gap-1 flex-1">
                               <select 
                                 className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-black uppercase dark:text-white focus:outline-none focus:border-blue-500 min-w-0"
                                 value={calendarViewDate.getMonth()}
                                 onChange={(e) => {
                                     const newDate = new Date(calendarViewDate);
                                     newDate.setMonth(parseInt(e.target.value));
                                     setCalendarViewDate(newDate);
                                 }}
                               >
                                   {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => (
                                       <option key={i} value={i}>{m}</option>
                                   ))}
                               </select>
                               <select 
                                 className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-black uppercase dark:text-white focus:outline-none focus:border-blue-500"
                                 value={calendarViewDate.getFullYear()}
                                 onChange={(e) => {
                                     const newDate = new Date(calendarViewDate);
                                     newDate.setFullYear(parseInt(e.target.value));
                                     setCalendarViewDate(newDate);
                                 }}
                               >
                                   {[2024, 2025, 2026, 2027, 2028].map(y => (
                                       <option key={y} value={y}>{y}</option>
                                   ))}
                               </select>
                           </div>

                           <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                           </button>
                       </div>
                       
                       <div className="grid grid-cols-7 gap-1 mb-2">
                           {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                               <div key={d} className="text-center text-[10px] font-black text-slate-400">{d}</div>
                           ))}
                       </div>

                       <div className="grid grid-cols-7 gap-1">
                           {generateCalendarDays().map((day, idx) => {
                               if (day === null) return <div key={idx} />;
                               
                               const currentDayDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
                               const isHasInvoices = hasInvoicesOnDay(day);
                               
                               const isStart = calendarSelection.start && isSameDay(currentDayDate, calendarSelection.start);
                               const isEnd = calendarSelection.end && isSameDay(currentDayDate, calendarSelection.end);
                               const isInRange = calendarSelection.start && calendarSelection.end && currentDayDate > calendarSelection.start && currentDayDate < calendarSelection.end;

                               // Today logic
                               const today = new Date();
                               const isToday = currentDayDate.getDate() === today.getDate() && 
                                               currentDayDate.getMonth() === today.getMonth() && 
                                               currentDayDate.getFullYear() === today.getFullYear();

                               let bgClass = 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300';
                               let borderClass = 'border border-transparent';

                               if (isStart || isEnd) {
                                   bgClass = 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 z-10';
                               } else if (isInRange) {
                                   bgClass = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
                               } else if (isToday) {
                                   // Specific style for today
                                   borderClass = 'border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-black';
                               }

                               return (
                                   <button
                                     key={idx}
                                     onClick={() => handleCalendarDayClick(day)}
                                     className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold relative transition-all ${bgClass} ${borderClass}`}
                                   >
                                       {day}
                                       {isHasInvoices && !isStart && !isEnd && !isInRange && (
                                           <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></div>
                                       )}
                                   </button>
                               );
                           })}
                       </div>
                       
                       <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                           <div className="flex-1">
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Du</label>
                               <input 
                                   type="date" 
                                   value={toInputDate(calendarSelection.start)}
                                   onChange={(e) => {
                                       const date = parseInputDate(e.target.value);
                                       setCalendarSelection(prev => ({ ...prev, start: date }));
                                       if (date) setCalendarViewDate(date);
                                   }}
                                   className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                               />
                           </div>
                           <div className="flex-1">
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Au</label>
                               <input 
                                   type="date" 
                                   value={toInputDate(calendarSelection.end)}
                                   onChange={(e) => {
                                       const date = parseInputDate(e.target.value);
                                       setCalendarSelection(prev => ({ ...prev, end: date }));
                                   }}
                                   className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                               />
                           </div>
                       </div>

                       <button 
                          onClick={resetCalendar}
                          className="w-full mt-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
                       >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Réinitialiser
                       </button>
                   </div>
                )}
             </div>

             <div className="bg-blue-600 text-white px-8 py-3 rounded-[1.5rem] shadow-2xl shadow-blue-500/30 border border-blue-400/20 flex flex-col items-center justify-center min-w-[120px]">
               <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Score Global</p>
               <p className="text-2xl font-black leading-none mt-1">{stats.avgCompliance}%</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
          {/* Stats Cards */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-transform duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Encours Total</p>
            <p className="text-xl md:text-2xl font-black dark:text-white truncate">{stats.totalVal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
            <div className="w-12 h-1 bg-blue-600 rounded-full mt-4 transition-all"></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-transform duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">À Valider</p>
            <p className="text-xl md:text-2xl font-black text-amber-500">{stats.toValidate}</p>
            <div className="w-12 h-1 bg-amber-500 rounded-full mt-4 transition-all"></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-transform duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payées</p>
            <p className="text-xl md:text-2xl font-black text-green-500">{stats.paidCount}</p>
            <div className="w-12 h-1 bg-green-500 rounded-full mt-4 transition-all"></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-transform duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume</p>
            <p className="text-xl md:text-2xl font-black dark:text-white">{completed.length}</p>
            <div className="w-12 h-1 bg-slate-400 rounded-full mt-4 transition-all"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Charts */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-colors duration-300">
            <h3 className="font-black dark:text-white text-lg md:text-xl uppercase tracking-tighter mb-8 border-b-2 border-slate-50 dark:border-slate-800 pb-4">Budget par Poste</h3>
            <div className="h-72 relative">
              {stats.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={stats.pieData} 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={8} 
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyStateGraph message="Aucune donnée sur la période" />
              )}
            </div>
            {stats.pieData.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 justify-center">
                {stats.pieData.map((entry, i) => {
                    const percentage = stats.totalVal > 0 ? ((entry.value / stats.totalVal) * 100).toFixed(1) : '0.0';
                    return (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-lg" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                        {entry.name} <span className="text-slate-400 opacity-70 ml-1">({percentage}%)</span>
                        </span>
                    </div>
                    );
                })}
                </div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-colors duration-300">
            <h3 className="font-black dark:text-white text-lg md:text-xl uppercase tracking-tighter mb-8 border-b-2 border-slate-50 dark:border-slate-800 pb-4">Volume par Fournisseur</h3>
            <div className="h-72">
               {stats.barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.1} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: '900' }} 
                        interval={0}
                        tickFormatter={(val) => val.length > 12 ? val.substring(0, 10) + '...' : val}
                    />
                    <YAxis hide />
                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)', radius: 12 }} 
                    />
                    <Bar dataKey="total" radius={[12, 12, 0, 0]} barSize={32}>
                        {stats.barData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
               ) : (
                <EmptyStateGraph message="Aucune activité récente" />
               )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors duration-300">
          <div className="p-6 md:p-10 border-b-2 border-slate-50 dark:border-slate-800 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1 w-full">
              <h3 className="font-black dark:text-white text-xl md:text-2xl uppercase tracking-tighter break-words">Flux Archivés</h3>

              <div ref={searchContainerRef} className="relative w-full md:flex-1 md:max-w-md group">
                <input 
                  type="text" 
                  placeholder="Rechercher par document, fournisseur..." 
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={e => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
                <svg className="w-5 h-5 absolute right-4 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {/* Custom Search Suggestions - Blue Style */}
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {!searchQuery.trim() && (
                      <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fournisseurs détectés</span>
                      </div>
                    )}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {searchSuggestions.map((vendor, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(vendor);
                            setIsSearchFocused(false);
                          }}
                          className="w-full text-left px-6 py-3 text-sm font-black text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-800 flex items-center gap-2 group/item"
                        >
                           {renderVendorIcon(vendor)}
                           {vendor}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 animate-in zoom-in-95 duration-200">
              {selectedIds.length > 0 && (
                <>
                  <button 
                    onClick={() => handleBulkStatusUpdate('paid')}
                    className="flex-1 md:flex-none bg-green-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-green-700 transition-all"
                  >
                    Passer en Payé ({selectedIds.length})
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exporter ({selectedIds.length})
                  </button>
                  <button 
                    onClick={() => setSelectedIds([])}
                    className="flex-1 md:flex-none bg-slate-100 dark:bg-slate-800 text-slate-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="px-6 md:px-10 pb-10">
            <div className="overflow-x-auto w-full">
              <div className="min-w-[1000px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-10 py-8 w-12">
                        <button 
                          onClick={toggleSelectAll}
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                            selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0
                              ? 'bg-blue-600 border-blue-600 shadow-blue-500/20 shadow-md' 
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0 && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </button>
                      </th>
                      {/* Sortable Headers with Filters */}
                      <th className="px-6 py-8 relative group/header">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleSort('name')} className="flex items-center gap-1 group/sort hover:text-blue-600 transition-colors">
                            Document <SortIcon column="name" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setIsFilterMenuOpen(isFilterMenuOpen === 'id' ? null : 'id'); }} className="group">
                            <FilterIcon active={!!columnFilters.id || isFilterMenuOpen === 'id'} />
                          </button>
                        </div>
                        {isFilterMenuOpen === 'id' && (
                          <div className="absolute top-full left-6 right-6 z-20 animate-in slide-in-from-top-1">
                            <input type="text" autoFocus value={columnFilters.id} onChange={e => setColumnFilters({...columnFilters, id: e.target.value})} onClick={(e) => e.stopPropagation()} className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-xl text-xs dark:text-white lowercase font-bold shadow-xl outline-none" placeholder="Filtre ID..." />
                          </div>
                        )}
                      </th>
                      <th className="px-6 py-8 relative group/header">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleSort('vendor')} className="flex items-center gap-1 group/sort hover:text-blue-600 transition-colors">
                            Fournisseur <SortIcon column="vendor" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setIsFilterMenuOpen(isFilterMenuOpen === 'vendor' ? null : 'vendor'); }} className="group">
                            <FilterIcon active={!!columnFilters.vendor || isFilterMenuOpen === 'vendor'} />
                          </button>
                        </div>
                        {isFilterMenuOpen === 'vendor' && (
                          <div className="absolute top-full left-6 right-6 z-20 animate-in slide-in-from-top-1">
                            <input type="text" autoFocus value={columnFilters.vendor} onChange={e => setColumnFilters({...columnFilters, vendor: e.target.value})} onClick={(e) => e.stopPropagation()} className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-xl text-xs dark:text-white font-bold shadow-xl outline-none" placeholder="Filtre Nom..." />
                          </div>
                        )}
                      </th>
                      <th className="px-6 py-8">
                        <button onClick={() => toggleSort('date')} className="flex items-center gap-1 group/sort hover:text-blue-600 transition-colors">
                          Date <SortIcon column="date" />
                        </button>
                      </th>
                      <th className="px-6 py-8">
                        <button onClick={() => toggleSort('total')} className="flex items-center gap-1 group/sort hover:text-blue-600 transition-colors">
                          Montant <SortIcon column="total" />
                        </button>
                      </th>
                      <th className="px-6 py-8 relative group/header">
                         <div className="flex items-center gap-1">
                           <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Statut</span>
                           <button onClick={(e) => { e.stopPropagation(); setIsFilterMenuOpen(isFilterMenuOpen === 'status' ? null : 'status'); }} className="group">
                             <FilterIcon active={columnFilters.status !== 'all' || isFilterMenuOpen === 'status'} />
                           </button>
                         </div>
                         {isFilterMenuOpen === 'status' && (
                            <div className="absolute top-full right-0 min-w-[140px] z-20 animate-in slide-in-from-top-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl shadow-xl p-1 flex flex-col gap-1">
                                {(['all', 'draft', 'to_validate', 'validated', 'paid'] as const).map((st) => (
                                    <button
                                        key={st}
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setColumnFilters(prev => ({...prev, status: st})); 
                                            setIsFilterMenuOpen(null); 
                                        }}
                                        className={`text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                                            columnFilters.status === st 
                                            ? 'bg-blue-600 text-white shadow-md' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        {st === 'all' ? 'Tout' : statusLabels[st]}
                                    </button>
                                ))}
                            </div>
                         )}
                      </th>
                      <th className="px-6 py-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium text-xs uppercase tracking-widest">
                          Aucun document ne correspond à votre recherche
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr 
                          key={inv.id} 
                          onClick={() => onOpenReport && onOpenReport(inv)}
                          className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          <td className="px-10 py-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSelectOne(inv.id); }}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                selectedIds.includes(inv.id) 
                                  ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/30' 
                                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {selectedIds.includes(inv.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                                <p className="text-sm font-bold dark:text-white group-hover:text-blue-600 transition-colors">{inv.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inv.id.split('-')[1] || inv.id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-200 transition-colors">
                                   {renderVendorIcon(inv.summary?.vendor || '')}
                                </div>
                                <span className="text-xs font-bold dark:text-slate-300">{inv.summary?.vendor || 'Inconnu'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{inv.summary?.date}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-black dark:text-white tracking-tight">{inv.summary?.totalTTC}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                               inv.summary?.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400' :
                               inv.summary?.paymentStatus === 'validated' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400' :
                               inv.summary?.paymentStatus === 'to_validate' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400' :
                               'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                             }`}>
                               {statusLabels[inv.summary?.paymentStatus || 'draft']}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-slate-800 transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;