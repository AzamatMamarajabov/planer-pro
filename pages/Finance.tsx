import React, { useState, useMemo } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Sparkles, X, 
  Target, Zap, ArrowRight, Activity, CreditCard, 
  Umbrella, Check, Trash2, Calendar, Trophy, AlertCircle, ArrowUpRight, PlusCircle,
  Download, Printer, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip as ReTooltip
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { SavingGoal, Debt } from '../types';

export const FinancePage = () => {
  const { 
    language, transactions, addTransaction, deleteTransaction,
    goals, addGoal, updateGoal, deleteGoal,
    debts, addDebt, updateDebt, deleteDebt, userName
  } = useApp();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'debts'>('dashboard');
  const [magicInput, setMagicInput] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [modalType, setModalType] = useState<'transaction' | 'goal' | 'debt' | 'deposit' | 'payDebt' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [amountInput, setAmountInput] = useState('');
  
  const [transType, setTransType] = useState<'income' | 'expense'>('expense');
  const [transCategory, setTransCategory] = useState('other');

  // --- Calculations ---
  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyTrans = transactions.filter(t => t.date.startsWith(currentMonth));
    
    let inc = 0, exp = 0;
    monthlyTrans.forEach(t => {
        let rawAmount = t.amount;
        if (typeof rawAmount === 'string') rawAmount = parseFloat(rawAmount.replace(',', '.'));
        const val = Math.abs(Number(rawAmount) || 0);
        if (t.type === 'income') inc += val; else exp += val;
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
        transactions.filter(t => t.date === dateStr && t.type === 'expense').forEach(t => {
            dailyExp += Math.abs(Number(t.amount) || 0);
        });
        data.push({ name: d.getDate(), value: dailyExp });
    }
    return data;
  }, [transactions]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return transactions.slice(start, start + itemsPerPage);
  }, [transactions, currentPage]);

  const exportToExcel = () => {
    const headers = ["ID", "Sana", "Nomi", "Kategoriya", "Turi", "Summa"];
    const rows = transactions.map(t => [t.id, t.date, `"${t.title}"`, t.category, t.type, t.amount]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Planify_Finance_${getLocalDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
      // Simplified print logic for brevity
      window.print(); 
  };

  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!magicInput.trim()) return;
    const numberMatch = magicInput.match(/[\d\.\,]+/);
    if(!numberMatch) return;
    const rawNumber = numberMatch[0].replace(',', '.');
    const amount = Math.abs(parseFloat(rawNumber));
    const title = magicInput.replace(rawNumber, '').trim() || (language === 'uz' ? 'Xarajat' : 'Расход');
    let category = 'other';
    const lowerTitle = title.toLowerCase();
    if (['taxi', 'yandex', 'bus', 'metro'].some(k => lowerTitle.includes(k))) category = 'transport';
    else if (['osh', 'non', 'lunch', 'ovqat', 'coffee'].some(k => lowerTitle.includes(k))) category = 'food';
    else if (['payme', 'click', 'internet', 'telefon'].some(k => lowerTitle.includes(k))) category = 'bills';
    await addTransaction({ amount, type: 'expense', category, title, date: getLocalDate() });
    setMagicInput('');
  };

  const handleManualTransaction = async (e: React.FormEvent) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const title = fd.get('title') as string;
      const amount = parseFloat(fd.get('amount') as string);
      if (title && amount > 0) {
          await addTransaction({ title, amount, type: transType, category: transCategory, date: fd.get('date') as string });
          setModalType(null);
      }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const title = fd.get('title') as string;
      const amount = parseFloat(fd.get('amount') as string);
      if (title && amount > 0) {
          await addGoal({ title, targetAmount: amount, currentAmount: 0, color: 'bg-indigo-500', deadline: fd.get('date') as string });
          setModalType(null);
      }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const title = fd.get('title') as string;
      const amount = parseFloat(fd.get('amount') as string);
      if (title && amount > 0) {
          await addDebt({ title, totalAmount: amount, paidAmount: 0, interestRate: parseFloat(fd.get('rate') as string || '0') });
          setModalType(null);
      }
  };

  const handleDeposit = async () => {
    const val = parseFloat(amountInput.replace(',', '.'));
    if (isNaN(val) || val <= 0 || !selectedItem) return;
    await updateGoal({ id: selectedItem.id, currentAmount: selectedItem.currentAmount + val });
    await addTransaction({ amount: val, type: 'expense', category: 'other', title: `Saving: ${selectedItem.title}`, date: getLocalDate() });
    setModalType(null);
  };

  const handlePayDebt = async () => {
    const val = parseFloat(amountInput.replace(',', '.'));
    if (isNaN(val) || val <= 0 || !selectedItem) return;
    await updateDebt({ id: selectedItem.id, paidAmount: Math.min(selectedItem.totalAmount, selectedItem.paidAmount + val) });
    await addTransaction({ amount: val, type: 'expense', category: 'bills', title: `Debt: ${selectedItem.title}`, date: getLocalDate() });
    setModalType(null);
  };

  const handleQuickAdd = async (title: string, category: string, amount: number) => {
    await addTransaction({ amount, type: 'expense', category, title, date: getLocalDate() });
  };

  const goToPage = (p: number) => setCurrentPage(p);

  const openDepositModal = (goal: any) => {
      setSelectedItem(goal);
      setModalType('deposit');
      setAmountInput('');
  };

  const openPayDebtModal = (debt: any) => {
      setSelectedItem(debt);
      setModalType('payDebt');
      setAmountInput('');
  };

  const sortedDebts = [...debts].sort((a, b) => (a.totalAmount - a.paidAmount) - (b.totalAmount - b.paidAmount));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2">
      
      {/* Header */}
      <div className="space-y-4 px-2">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
             <div>
                 <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Finance<span className="ai-gradient-text">Hub</span></h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pro Money Management</p>
             </div>
             <div className="flex w-full md:w-auto bg-slate-900/50 p-1 rounded-2xl border border-white/5">
                 {(['dashboard', 'goals', 'debts'] as const).map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 md:flex-none p-3 rounded-xl transition-all flex justify-center ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                     >
                        {tab === 'dashboard' && <Wallet size={18} />}
                        {tab === 'goals' && <Target size={18} />}
                        {tab === 'debts' && <Umbrella size={18} />}
                     </button>
                 ))}
             </div>
         </div>

         <div className="relative z-20">
             <form onSubmit={handleMagicSubmit} className="relative group">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                 <input 
                    type="text" 
                    value={magicInput}
                    onChange={(e) => setMagicInput(e.target.value)}
                    placeholder={language === 'uz' ? "Masalan: 45000 tushlik..." : "Например: 45000 обед..."}
                    className="w-full p-4 md:p-6 pl-12 md:pl-14 bg-slate-900 border border-white/10 rounded-[2rem] text-lg md:text-xl font-bold text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition-all shadow-2xl relative z-10"
                 />
                 <Sparkles className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-indigo-500 z-20" size={20} />
                 <button type="submit" className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-colors z-20 active:scale-90">
                     <ArrowRight size={20} />
                 </button>
             </form>
             
             <div className="flex justify-between items-center mt-4">
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
                     {[ { l: 'Lunch', val: 35000 }, { l: 'Taxi', val: 20000 }, { l: 'Bozor', val: 100000 }, { l: 'Coffee', val: 25000 } ].map((act, i) => (
                         <button key={i} onClick={() => handleQuickAdd(act.l, 'other', act.val)} className="px-4 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-800 hover:text-white whitespace-nowrap active:scale-95 transition-all">
                             {act.l}
                         </button>
                     ))}
                 </div>
                 <button onClick={() => setModalType('transaction')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/5 transition-colors whitespace-nowrap ml-2">
                    <PlusCircle size={14} /> Add
                 </button>
             </div>
         </div>
      </div>

      <AnimatePresence>
          {aiAdvice && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 p-4 rounded-[1.5rem] border border-indigo-500/20 flex gap-3 items-start">
                      <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><Sparkles size={16} /></div>
                      <p className="text-xs md:text-sm font-medium text-indigo-100 leading-relaxed italic flex-1">"{aiAdvice}"</p>
                      <button onClick={() => setAiAdvice(null)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-3 px-2">
                  <div className="neo-card p-4 md:p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-emerald-900/20 to-slate-900/40 relative overflow-hidden">
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">{t.income}</p>
                      <h3 className="text-2xl md:text-3xl font-black text-white truncate">+{totalIncome.toLocaleString()}</h3>
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-emerald-500"><TrendingUp size={60} /></div>
                  </div>
                  <div className="neo-card p-4 md:p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-rose-900/20 to-slate-900/40 relative overflow-hidden">
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">{t.expense}</p>
                      <h3 className="text-2xl md:text-3xl font-black text-white truncate">-{totalExpense.toLocaleString()}</h3>
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-rose-500"><TrendingDown size={60} /></div>
                  </div>
              </div>

              <div className="px-2">
                 <div className="neo-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 min-h-[220px]">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={16} className="text-indigo-400" /> Hafta Faolligi</h3>
                     <div className="h-[150px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#colorVal)" />
                                <ReTooltip contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                 </div>
              </div>

              <div className="px-2 space-y-4">
                  <div className="flex justify-between items-center ml-2 mr-2">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">O'tkazmalar</h3>
                      <div className="flex gap-2">
                          <button onClick={exportToExcel} className="p-2 bg-slate-800 hover:bg-emerald-600/20 text-emerald-500 rounded-xl transition-colors" title="Excel"><Download size={16} /></button>
                      </div>
                  </div>

                  {currentTransactions.map(tr => (
                      <div key={tr.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                              <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${tr.type === 'expense' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                  {tr.type === 'expense' ? <TrendingDown size={18}/> : <TrendingUp size={18}/>}
                              </div>
                              <div className="min-w-0">
                                  <p className="font-bold text-white text-sm truncate">{tr.title}</p>
                                  <p className="text-[9px] text-slate-500 font-black uppercase truncate">{tr.date} • {tr.category}</p>
                              </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                              <p className={`font-black text-sm ${tr.type === 'expense' ? 'text-white' : 'text-emerald-400'}`}>
                                  {tr.type === 'expense' ? '-' : '+'}{Number(tr.amount).toLocaleString()}
                              </p>
                              <button onClick={() => deleteTransaction(tr.id)} className="text-[9px] text-slate-600 hover:text-rose-500 p-1">O'chirish</button>
                          </div>
                      </div>
                  ))}
                  
                  {transactions.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-4 py-2">
                       <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-xl bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronLeft size={20} /></button>
                       <span className="text-xs font-black text-slate-500">{currentPage} / {totalPages}</span>
                       <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronRight size={20} /></button>
                    </div>
                  )}
              </div>
          </motion.div>
      )}

      {/* --- GOALS TAB --- */}
      {activeTab === 'goals' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 px-2">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-black text-white">Maqsadlar</h3>
                  <button onClick={() => setModalType('goal')} className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl active:scale-95"><Plus size={20} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map(goal => {
                      const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                      const isCompleted = percent >= 100;
                      return (
                        <div key={goal.id} className="neo-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-br from-indigo-600 to-purple-600'}`}>
                                        {isCompleted ? <Trophy size={24} /> : <Target size={24} />}
                                    </div>
                                    <button onClick={() => deleteGoal(goal.id)} className="text-slate-600 hover:text-rose-500 p-2"><Trash2 size={16}/></button>
                                </div>
                                <h3 className="text-lg font-black text-white mb-1 truncate">{goal.title}</h3>
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-xs text-slate-400 font-bold"><span className="text-white">{goal.currentAmount.toLocaleString()}</span> / {goal.targetAmount.toLocaleString()}</p>
                                    <span className={`text-lg font-black ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>{percent.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden mb-3 border border-white/5">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`} />
                                </div>
                                {!isCompleted && (
                                    <button onClick={() => openDepositModal(goal)} className="w-full py-3 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        To'ldirish
                                    </button>
                                )}
                            </div>
                        </div>
                      );
                  })}
              </div>
          </motion.div>
      )}

      {/* --- DEBTS TAB --- */}
      {activeTab === 'debts' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 px-2">
              <div className="bg-rose-950/20 p-6 rounded-[2.5rem] border border-rose-500/20 text-center">
                   <h3 className="text-xl font-black text-white mb-2 flex items-center justify-center gap-2"><Umbrella size={20} className="text-rose-500" /> Snowball</h3>
                   <button onClick={() => setModalType('debt')} className="mt-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase shadow-lg active:scale-95">+ Qarz qo'shish</button>
              </div>

              <div className="space-y-4">
                  {sortedDebts.map((debt, idx) => {
                      const remaining = debt.totalAmount - debt.paidAmount;
                      const progress = (debt.paidAmount / debt.totalAmount) * 100;
                      return (
                          <motion.div key={debt.id} className="neo-card p-5 rounded-[2rem] border border-white/5 relative">
                              <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-xs border border-white/10">#{idx + 1}</div>
                                      <div>
                                          <h4 className="font-bold text-white text-base">{debt.title}</h4>
                                          <p className="text-[9px] text-slate-500 font-black uppercase">{debt.interestRate}% ustama</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-rose-400 font-black text-lg">{remaining.toLocaleString()}</p>
                                      <p className="text-[9px] text-slate-600 font-bold uppercase">Qoldiq</p>
                                  </div>
                              </div>
                              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden mb-4 border border-white/5">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => openPayDebtModal(debt)} disabled={remaining <= 0} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${remaining <= 0 ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white border border-white/10'}`}>
                                      {remaining <= 0 ? 'To\'landi' : 'To\'lash'}
                                  </button>
                                  <button onClick={() => deleteDebt(debt.id)} className="p-3 bg-slate-900 rounded-xl text-slate-600 hover:text-rose-500 border border-white/5"><Trash2 size={16} /></button>
                              </div>
                          </motion.div>
                      );
                  })}
              </div>
          </motion.div>
      )}

      {/* --- UNIVERSAL MOBILE OPTIMIZED MODAL --- */}
      <AnimatePresence>
        {modalType && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-end md:items-center justify-center sm:p-4"
                onClick={() => setModalType(null)}
            >
                <motion.div 
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-slate-900 border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 pb-12 md:pb-8 relative shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 md:hidden opacity-50" />
                    <button onClick={() => setModalType(null)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-500"><X size={20}/></button>

                    {/* MANUAL TRANSACTION FORM */}
                    {modalType === 'transaction' && (
                        <form onSubmit={handleManualTransaction} className="space-y-5">
                            <h3 className="text-xl font-black text-white text-center">Yangi O'tkazma</h3>
                            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-white/5">
                                <button type="button" onClick={() => setTransType('income')} className={`py-3 rounded-xl font-bold transition-all ${transType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>Kirim</button>
                                <button type="button" onClick={() => setTransType('expense')} className={`py-3 rounded-xl font-bold transition-all ${transType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>Chiqim</button>
                            </div>
                            <input name="amount" type="number" placeholder="Summa" autoFocus className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10 text-xl font-bold" required />
                            <input name="title" placeholder="Izoh" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10" required />
                            <select value={transCategory} onChange={(e) => setTransCategory(e.target.value)} className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10 appearance-none">
                                {(transType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                            </select>
                            <input name="date" type="date" defaultValue={getLocalDate()} className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10" />
                            <button className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl">Saqlash</button>
                        </form>
                    )}

                    {/* GOAL FORM */}
                    {modalType === 'goal' && (
                        <form onSubmit={handleAddGoal} className="space-y-5">
                            <h3 className="text-xl font-black text-white text-center">Yangi Maqsad</h3>
                            <input name="title" autoFocus placeholder="Nomi" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10 font-bold" required />
                            <input name="amount" type="number" placeholder="Summa" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10 font-bold" required />
                            <input name="date" type="date" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10" />
                            <button className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl">Qo'shish</button>
                        </form>
                    )}

                    {/* DEBT FORM */}
                    {modalType === 'debt' && (
                        <form onSubmit={handleAddDebt} className="space-y-5">
                            <h3 className="text-xl font-black text-white text-center">Qarz Qo'shish</h3>
                            <input name="title" autoFocus placeholder="Kimdan" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10 font-bold" required />
                            <input name="amount" type="number" placeholder="Summa" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10 font-bold" required />
                            <input name="rate" type="number" placeholder="Foiz %" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-white/10" />
                            <button className="w-full py-4 bg-rose-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl">Saqlash</button>
                        </form>
                    )}

                    {/* DEPOSIT/PAY FORM */}
                    {(modalType === 'deposit' || modalType === 'payDebt') && selectedItem && (
                        <div className="space-y-6">
                             <div className="text-center">
                                <h3 className="text-xl font-black text-white">{modalType === 'deposit' ? 'To\'ldirish' : 'To\'lash'}</h3>
                                <p className="text-sm text-slate-500 font-bold">{selectedItem.title}</p>
                            </div>
                            <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} placeholder="0" autoFocus className="w-full p-5 text-center bg-slate-950 rounded-3xl text-3xl font-black text-white outline-none border border-white/10" />
                            <div className="grid grid-cols-3 gap-2">
                                {[10000, 50000, 100000].map(amt => (
                                    <button key={amt} onClick={() => setAmountInput(amt.toString())} className="py-2 bg-white/5 rounded-xl text-[10px] font-bold text-slate-400">+{amt/1000}k</button>
                                ))}
                            </div>
                            <button onClick={modalType === 'deposit' ? handleDeposit : handlePayDebt} className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest">Tasdiqlash</button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
