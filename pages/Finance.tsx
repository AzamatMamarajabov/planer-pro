
import React, { useState, useMemo, useEffect } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Sparkles, X, 
  Target, Zap, ArrowRight, Activity, Trash2,
  PiggyBank, CreditCard, ShieldCheck, DollarSign, Handshake, Clock,
  Edit3, CalendarRange, Download, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { SavingGoal, Debt, Transaction } from '../types';

export const FinancePage = () => {
  const { 
    language, transactions, addTransaction, deleteTransaction,
    goals, addGoal, updateGoal, deleteGoal,
    debts, addDebt, updateDebt, deleteDebt, setIsModalActive
  } = useApp();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'debts'>('dashboard');
  const [magicInput, setMagicInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Export States
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Oyning boshi
    return getLocalDate(d);
  });
  const [exportEndDate, setExportEndDate] = useState(getLocalDate());

  // Modal States
  const [modalType, setModalType] = useState<'transaction' | 'goal' | 'debt' | 'deposit' | 'pay' | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [amountInput, setAmountInput] = useState('');
  const [transType, setTransType] = useState<'income' | 'expense'>('expense');
  const [transCategory, setTransCategory] = useState('other');

  useEffect(() => {
    setIsModalActive(!!modalType);
    return () => setIsModalActive(false);
  }, [modalType, setIsModalActive]);

  // Calculations
  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    let inc = 0, exp = 0;
    transactions.forEach(tr => {
        const val = Math.abs(Number(tr.amount) || 0);
        if (tr.type === 'income') inc += val; else exp += val;
    });
    return { totalIncome: inc, totalExpense: exp, totalBalance: inc - exp };
  }, [transactions]);

  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();
    for(let i=6; i>=0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDate(d);
        let dailyExp = 0;
        transactions.filter(tr => tr.date === dateStr && tr.type === 'expense').forEach(tr => {
            dailyExp += Math.abs(Number(tr.amount) || 0);
        });
        data.push({ 
            name: d.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' }), 
            value: dailyExp 
        });
    }
    return data;
  }, [transactions, language]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;

  const currentTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // --- Export Functions ---
  const printReport = () => {
    const data = sortedTransactions.filter(tr => tr.date >= exportStartDate && tr.date <= exportEndDate);
    if (data.length === 0) {
        alert(language === 'uz' ? "Ma'lumot topilmadi" : "Данные не найдены");
        return;
    }
    const totalInc = data.filter(tr => tr.type === 'income').reduce((acc, tr) => acc + Number(tr.amount), 0);
    const totalExp = data.filter(tr => tr.type === 'expense').reduce((acc, tr) => acc + Number(tr.amount), 0);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>FinanceHub Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
            .period { font-size: 14px; color: #64748b; margin-top: 5px; }
            .stats { display: flex; gap: 40px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; }
            .stat-box { display: flex; flex-direction: column; }
            .stat-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; }
            .stat-val { font-size: 20px; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .income { color: #10b981; font-weight: 700; }
            .expense { color: #ef4444; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">FinanceHub Report</h1>
            <p class="period">${exportStartDate} - ${exportEndDate}</p>
          </div>
          <div class="stats">
            <div class="stat-box"><span class="stat-label">Kirim</span><span class="stat-val">+${totalInc.toLocaleString()}</span></div>
            <div class="stat-box"><span class="stat-label">Chiqim</span><span class="stat-val">-${totalExp.toLocaleString()}</span></div>
            <div class="stat-box"><span class="stat-label">Balans</span><span class="stat-val">${(totalInc - totalExp).toLocaleString()}</span></div>
          </div>
          <table>
            <thead><tr><th>Sana</th><th>Nomi</th><th>Kategoriya</th><th>Summa</th></tr></thead>
            <tbody>
              ${data.map(tr => `
                <tr>
                  <td>${tr.date}</td>
                  <td>${tr.title}</td>
                  <td style="text-transform: capitalize">${tr.category}</td>
                  <td class="${tr.type === 'income' ? 'income' : 'expense'}">${tr.type === 'income' ? '+' : '-'}${Number(tr.amount).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportToExcel = () => {
    const data = sortedTransactions.filter(tr => tr.date >= exportStartDate && tr.date <= exportEndDate);
    if (data.length === 0) {
        alert(language === 'uz' ? "Ma'lumot topilmadi" : "Данные не найдены");
        return;
    }
    
    const headers = ["Sana", "Nomi", "Kategoriya", "Turi", "Summa"];
    const rows = data.map(tr => [
        tr.date,
        `"${tr.title.replace(/"/g, '""')}"`,
        tr.category,
        tr.type === 'income' ? 'Kirim' : 'Chiqim',
        tr.amount.toString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_report_${exportStartDate}_to_${exportEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Actions ---
  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!magicInput.trim()) return;
    const num = magicInput.match(/[\d\.\,]+/);
    if(!num) return;
    const amount = Math.abs(parseFloat(num[0].replace(',', '.')));
    const title = magicInput.replace(num[0], '').trim() || (language === 'uz' ? 'Xarajat' : 'Расход');
    await addTransaction({ amount, type: 'expense', category: 'other', title, date: getLocalDate() });
    setMagicInput('');
  };

  const handleTransactionAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const title = fd.get('title') as string;
    const amount = parseFloat((fd.get('amount') as string).replace(',', '.'));
    const dateInput = fd.get('date') as string || getLocalDate();
    
    if (title && amount > 0) {
      await addTransaction({ title, amount, type: transType, category: transCategory, date: dateInput });
      setModalType(null);
    }
  };

  const handleGoalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const title = fd.get('title') as string;
    const target = parseFloat(fd.get('target') as string);
    
    if (isEditMode && selectedItem) {
      await updateGoal({ id: selectedItem.id, title, targetAmount: target });
    } else {
      await addGoal({ title, targetAmount: target, currentAmount: 0, color: 'bg-emerald-500' });
    }
    setModalType(null);
  };

  const handleDebtAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const title = fd.get('title') as string;
    const total = parseFloat(fd.get('total') as string);
    
    if (isEditMode && selectedItem) {
      await updateDebt({ id: selectedItem.id, title, totalAmount: total });
    } else {
      await addDebt({ title, totalAmount: total, paidAmount: 0, interestRate: 0 });
    }
    setModalType(null);
  };

  const openAddGoal = () => { setIsEditMode(false); setSelectedItem(null); setModalType('goal'); };
  const openEditGoal = (goal: SavingGoal) => { setIsEditMode(true); setSelectedItem(goal); setModalType('goal'); };
  const openAddDebt = () => { setIsEditMode(false); setSelectedItem(null); setModalType('debt'); };
  const openEditDebt = (debt: Debt) => { setIsEditMode(true); setSelectedItem(debt); setModalType('debt'); };

  const handleDepositConfirm = async () => {
    if(!amountInput || !selectedItem) return;
    const val = parseFloat(amountInput);
    await updateGoal({ id: selectedItem.id, currentAmount: selectedItem.currentAmount + val });
    await addTransaction({ title: `${selectedItem.title} (Jamg'arma)`, amount: val, type: 'expense', category: 'savings', date: getLocalDate() });
    setModalType(null);
    setAmountInput('');
  };

  const handlePayConfirm = async () => {
    if(!amountInput || !selectedItem) return;
    const val = parseFloat(amountInput);
    await updateDebt({ id: selectedItem.id, paidAmount: selectedItem.paidAmount + val });
    await addTransaction({ title: `${selectedItem.title} (Qarz to'lovi)`, amount: val, type: 'expense', category: 'debt', date: getLocalDate() });
    setModalType(null);
    setAmountInput('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-4 pb-48 px-2 md:px-4">
      
      {/* 💳 Branding Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="space-y-1">
             <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                Finance<span className="text-emerald-500 italic">Hub</span>
             </h2>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" /> {t.smartWallet}
             </p>
         </div>
         <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-2xl">
             {(['dashboard', 'goals', 'debts'] as const).map(tab => (
                 <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                 >
                    {tab === 'dashboard' ? t.dashboard : tab === 'goals' ? t.goals : tab === 'debts' ? t.debts : ''}
                 </button>
             ))}
         </div>
      </div>

      {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* AI Magic Input */}
              <form onSubmit={handleMagicSubmit} className="relative group">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-[2.5rem] blur-3xl opacity-50 group-focus-within:opacity-100 transition-opacity" />
                  <input 
                    type="text" value={magicInput} onChange={(e) => setMagicInput(e.target.value)}
                    placeholder={language === 'uz' ? "AI kiritish: 50000 tushlik uchun..." : "AI Ввод: 50000 на обед..."}
                    className="w-full p-6 md:p-8 pl-16 bg-slate-900/60 border border-white/10 rounded-[2.5rem] text-xl font-black text-white outline-none focus:border-indigo-500/50 transition-all backdrop-blur-3xl"
                  />
                  <Sparkles size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"><ArrowRight size={24} /></button>
              </form>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="neo-card p-8 rounded-[3rem] border border-emerald-500/10 bg-emerald-500/5 group">
                      <TrendingUp size={24} className="text-emerald-500 mb-4" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.income}</p>
                      <h3 className="text-4xl font-black text-white">+{totalIncome.toLocaleString()}</h3>
                  </div>
                  <div className="neo-card p-8 rounded-[3rem] border border-rose-500/10 bg-rose-500/5 group">
                      <TrendingDown size={24} className="text-rose-500 mb-4" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.expense}</p>
                      <h3 className="text-4xl font-black text-white">-{totalExpense.toLocaleString()}</h3>
                  </div>
                  <div className="neo-card p-8 rounded-[3rem] border border-indigo-500/10 bg-indigo-500/5 group">
                      <Wallet size={24} className="text-indigo-500 mb-4" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.totalBalance}</p>
                      <h3 className={`text-4xl font-black ${totalBalance >= 0 ? 'text-white' : 'text-rose-500'}`}>{totalBalance.toLocaleString()}</h3>
                  </div>
              </div>

              {/* Chart & Report Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 neo-card p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 min-h-[400px]">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Activity size={18} className="text-indigo-500" /> {t.spendingTrend}
                      </h3>
                      <div className="h-[280px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={trendData}>
                                  <defs>
                                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                  <XAxis dataKey="name" hide />
                                  <YAxis hide />
                                  <ReTooltip 
                                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                      labelStyle={{ color: '#fff', fontWeight: 900 }}
                                  />
                                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#chartGrad)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Export Box */}
                  <div className="neo-card p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 space-y-6 flex flex-col justify-between">
                      <div className="space-y-6">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CalendarRange size={16}/> Hisobot Export</h3>
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-600 uppercase ml-2">Boshlanish</label>
                                  <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className="w-full p-4 bg-slate-950 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-indigo-500/50" />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-600 uppercase ml-2">Tugash</label>
                                  <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className="w-full p-4 bg-slate-950 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-indigo-500/50" />
                              </div>
                          </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                          <button onClick={printReport} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"><FileText size={18} /> PDF Export</button>
                          <button onClick={exportToExcel} className="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 hover:bg-slate-700 transition-all"><Download size={18} /> CSV Export</button>
                      </div>
                  </div>
              </div>

              {/* Transaction List with Pagination */}
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.recentTransactions}</h3>
                      <button onClick={() => setModalType('transaction')} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-90 transition-all"><Plus size={16} /> {t.new}</button>
                  </div>
                  
                  <div className="space-y-3">
                      {currentTransactions.map(tr => (
                          <div key={tr.id} className="flex items-center justify-between p-5 bg-slate-900/40 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tr.type === 'expense' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                      {tr.type === 'expense' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                  </div>
                                  <div>
                                      <p className="font-black text-white tracking-tight leading-none mb-1">{tr.title}</p>
                                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{tr.date} • {tr.category}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className={`font-black text-lg tabular-nums ${tr.type === 'expense' ? 'text-white' : 'text-emerald-400'}`}>
                                      {tr.type === 'expense' ? '-' : '+'}{Number(tr.amount).toLocaleString()}
                                  </p>
                                  <button onClick={() => deleteTransaction(tr.id)} className="text-[9px] font-black text-slate-700 hover:text-rose-500 uppercase tracking-widest transition-colors">O'chirish</button>
                              </div>
                          </div>
                      ))}
                      
                      {sortedTransactions.length === 0 && (
                        <div className="py-12 text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                           {t.noTransactions}
                        </div>
                      )}
                  </div>

                  {/* 🚀 PAGINATION CONTROLS */}
                  {sortedTransactions.length > itemsPerPage && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-4 bg-slate-900/60 rounded-2xl text-slate-400 border border-white/5 disabled:opacity-20 hover:text-white transition-all active:scale-90"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 py-3 bg-slate-900/60 rounded-2xl border border-white/5 text-[10px] font-black text-white uppercase tracking-widest">
                            {currentPage} / {totalPages}
                        </div>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="p-4 bg-slate-900/60 rounded-2xl text-slate-400 border border-white/5 disabled:opacity-20 hover:text-white transition-all active:scale-90"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                  )}
              </div>
          </motion.div>
      )}

      {(activeTab === 'goals' || activeTab === 'debts') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${activeTab === 'goals' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {activeTab === 'goals' ? <Target size={24}/> : <Handshake size={24}/>}
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tighter">{activeTab === 'goals' ? t.goals : t.debts}</h3>
                  </div>
                  <button 
                    onClick={activeTab === 'goals' ? openAddGoal : openAddDebt} 
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-xl border-t border-white/20 ${activeTab === 'goals' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                  >
                    <Plus size={16} strokeWidth={3} /> {activeTab === 'goals' ? 'Yangi maqsad' : 'Yangi qarz'}
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'goals' ? (
                      goals.map(goal => {
                          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                          return (
                              <div key={goal.id} className="neo-card p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 relative group overflow-hidden">
                                  <div className="flex justify-between items-start mb-6">
                                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center"><PiggyBank size={28}/></div>
                                      <div className="flex gap-2">
                                          <button onClick={() => { setSelectedItem(goal); setModalType('deposit'); setAmountInput(''); }} className="p-3 bg-white text-black rounded-xl hover:scale-110 active:scale-90 transition-all shadow-xl"><Plus size={18}/></button>
                                          <button onClick={() => openEditGoal(goal)} className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:text-white transition-colors"><Edit3 size={18}/></button>
                                          <button onClick={() => deleteGoal(goal.id)} className="p-3 bg-slate-800 text-slate-300 hover:text-rose-500 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                      </div>
                                  </div>
                                  <h4 className="text-2xl font-black text-white mb-6 tracking-tight">{goal.title}</h4>
                                  <div className="flex justify-between items-end mb-3">
                                      <div>
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">To'plandi</p>
                                          <p className="text-2xl font-black text-emerald-400">{goal.currentAmount.toLocaleString()}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Maqsad</p>
                                          <p className="text-xl font-black text-white opacity-50">{goal.targetAmount.toLocaleString()}</p>
                                      </div>
                                  </div>
                                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-1 border border-white/5">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      debts.map(debt => {
                          const remaining = debt.totalAmount - debt.paidAmount;
                          const progress = (debt.paidAmount / debt.totalAmount) * 100;
                          return (
                              <div key={debt.id} className="neo-card p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 relative group">
                                  <div className="flex justify-between items-start mb-6">
                                      <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center"><DollarSign size={28}/></div>
                                      <div className="flex gap-2">
                                          <button onClick={() => { setSelectedItem(debt); setModalType('pay'); setAmountInput(''); }} className="px-4 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all shadow-xl">To'lash</button>
                                          <button onClick={() => openEditDebt(debt)} className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:text-white transition-colors"><Edit3 size={18}/></button>
                                          <button onClick={() => deleteDebt(debt.id)} className="p-3 bg-slate-800 text-slate-300 hover:text-rose-500 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                      </div>
                                  </div>
                                  <h4 className="text-2xl font-black text-white mb-6 tracking-tight">{debt.title}</h4>
                                  <div className="flex justify-between mb-3">
                                      <div>
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Qolgan</p>
                                          <p className="text-2xl font-black text-rose-500">{remaining.toLocaleString()}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Jami</p>
                                          <p className="text-xl font-black text-white opacity-40">{debt.totalAmount.toLocaleString()}</p>
                                      </div>
                                  </div>
                                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-1 border border-white/5">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-rose-600 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
          </motion.div>
      )}

      {/* --- MODALS --- */}
      <AnimatePresence>
        {modalType && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-end md:justify-center items-center sm:p-4" onClick={() => setModalType(null)}>
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#0F1115] border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-10 pb-safe shadow-[0_-20px_100px_rgba(0,0,0,0.8)]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter">
                              {modalType === 'transaction' ? t.addTransaction : 
                               modalType === 'goal' ? (isEditMode ? 'Tahrirlash' : 'Yangi Maqsad') : 
                               modalType === 'debt' ? (isEditMode ? 'Tahrirlash' : 'Yangi Qarz') : 
                               'Mablag\' kiritish'}
                            </h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">FinanceHub Portal</p>
                        </div>
                        <button onClick={() => setModalType(null)} className="p-3 text-slate-500 bg-white/5 rounded-full hover:text-white transition-all"><X size={24}/></button>
                    </div>

                    <div className="space-y-8 max-h-[70dvh] overflow-y-auto no-scrollbar pb-10">
                        {modalType === 'transaction' && (
                            <form onSubmit={handleTransactionAction} className="space-y-6">
                                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                                    <button type="button" onClick={() => setTransType('income')} className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${transType === 'income' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-600'}`}>Kirim</button>
                                    <button type="button" onClick={() => setTransType('expense')} className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${transType === 'expense' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-600'}`}>Chiqim</button>
                                </div>
                                <input name="amount" type="number" step="any" placeholder="Summa..." className="w-full bg-transparent border-none text-6xl font-black text-white text-center outline-none" required autoFocus />
                                <input name="title" type="text" placeholder="Nomi (masalan: Tushlik)" className="w-full p-5 bg-slate-950 rounded-2xl text-white outline-none border border-white/5 font-black focus:border-indigo-500/50" required />
                                <div className="grid grid-cols-2 gap-4">
                                  <select value={transCategory} onChange={(e) => setTransCategory(e.target.value)} className="w-full p-4 bg-slate-950 text-white rounded-2xl border border-white/5 font-black outline-none appearance-none">
                                      <option value="other">Boshqa</option>
                                      <option value="food">Oziq-ovqat</option>
                                      <option value="transport">Transport</option>
                                      <option value="shopping">Xaridlar</option>
                                      <option value="bills">To'lovlar</option>
                                  </select>
                                  <input type="date" name="date" defaultValue={getLocalDate()} className="w-full p-4 bg-slate-950 text-white rounded-2xl border border-white/5 font-black outline-none" />
                                </div>
                                <button type="submit" className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all">Saqlash</button>
                            </form>
                        )}

                        {modalType === 'goal' && (
                            <form onSubmit={handleGoalAction} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Sarlavha</label>
                                    <input name="title" defaultValue={selectedItem?.title || ''} placeholder="Masalan: Yangi noutbuk..." className="w-full p-5 bg-slate-950 rounded-2xl text-white outline-none border border-white/5 font-black text-lg" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Maqsadli summa</label>
                                    <input name="target" type="number" step="any" defaultValue={selectedItem?.targetAmount || ''} placeholder="0" className="w-full p-5 bg-slate-950 rounded-2xl text-white outline-none border border-white/5 font-black text-3xl" required />
                                </div>
                                <button type="submit" className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl transition-all ${activeTab === 'goals' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                  {isEditMode ? 'Yangilash' : 'Saqlash'}
                                </button>
                            </form>
                        )}

                        {modalType === 'debt' && (
                            <form onSubmit={handleDebtAction} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Sarlavha</label>
                                    <input name="title" defaultValue={selectedItem?.title || ''} placeholder="Masalan: Azizdan qarz..." className="w-full p-5 bg-slate-950 rounded-2xl text-white outline-none border border-white/5 font-black text-lg" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Umumiy summa</label>
                                    <input name="total" type="number" step="any" defaultValue={selectedItem?.totalAmount || ''} placeholder="0" className="w-full p-5 bg-slate-950 rounded-2xl text-white outline-none border border-white/5 font-black text-3xl" required />
                                </div>
                                <button type="submit" className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl transition-all ${activeTab === 'goals' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                  {isEditMode ? 'Yangilash' : 'Saqlash'}
                                </button>
                            </form>
                        )}
                        
                        {(modalType === 'deposit' || modalType === 'pay') && (
                           <div className="space-y-10 py-4 text-center">
                               <div>
                                   <p className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">{modalType === 'deposit' ? 'Jamg\'arish' : 'Qarz to\'lash'}</p>
                                   <h4 className="text-2xl font-black text-white">{selectedItem?.title}</h4>
                               </div>
                               <input 
                                   type="number" step="any" value={amountInput} onChange={e => setAmountInput(e.target.value)}
                                   placeholder="0" className="w-full bg-transparent text-6xl font-black text-white text-center outline-none"
                                   autoFocus
                               />
                               <button 
                                   onClick={modalType === 'deposit' ? handleDepositConfirm : handlePayConfirm}
                                   className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95"
                               >
                                   Tasdiqlash
                               </button>
                           </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
