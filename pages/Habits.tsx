
import React, { useState, useMemo, useEffect } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS, HABIT_COLORS } from '../constants';
import { 
  Plus, CheckCircle2, Flame, Trash2, LayoutGrid, Zap, Target, 
  ChevronLeft, ChevronRight, Activity, X, Info, Trophy, Star,
  Circle, Edit3, Palette
} from 'lucide-react';
import { HabitAnalytics } from '../components/HabitAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../types';

const calculateCurrentStreak = (completedDates: string[]) => {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  let current = new Date();
  const today = getLocalDate(current);
  current.setDate(current.getDate() - 1);
  const yesterday = getLocalDate(current);
  if (!completedDates.includes(today) && !completedDates.includes(yesterday)) return 0;
  let checkDate = completedDates.includes(today) ? new Date(today) : new Date(yesterday);
  while (completedDates.includes(getLocalDate(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
};

export const HabitsPage = () => {
  const { language, habits, addHabit, deleteHabit, toggleHabitForDate, setIsModalActive } = useApp();
  const t = TRANSLATIONS[language];
  
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState(HABIT_COLORS[0]);

  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');
  const [weekOffset, setWeekOffset] = useState(0); 
  const todayStr = getLocalDate(new Date());

  useEffect(() => {
    setIsModalActive(!!modalType);
    return () => setIsModalActive(false);
  }, [modalType, setIsModalActive]);

  const currentWeekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
    startOfWeek.setDate(diff + (weekOffset * 7));
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dateStr: getLocalDate(d),
        label: d.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' }).charAt(0).toUpperCase(),
        dayNum: d.getDate(),
        isToday: getLocalDate(d) === todayStr
      });
    }
    return days;
  }, [language, weekOffset, todayStr]);

  const openAdd = () => {
    setHabitName('');
    setHabitColor(HABIT_COLORS[habits.length % HABIT_COLORS.length]);
    setModalType('add');
  };

  const openEdit = (h: Habit) => {
    setSelectedHabit(h);
    setHabitName(h.title);
    setHabitColor(h.color);
    setModalType('edit');
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!habitName.trim()) return;

    if (modalType === 'add') {
      await addHabit({
        id: Math.random().toString(36).substr(2, 9),
        title: habitName,
        streak: 0, 
        completedDates: [],
        color: habitColor
      });
    }
    setModalType(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-40 space-y-8 pt-4">
      
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
           <div className="space-y-1">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                 Odatlar <span className="ai-gradient-text">Lab</span>
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Consistency is the king of success</p>
           </div>
           <button 
             onClick={openAdd}
             className="p-5 bg-indigo-600 text-white rounded-[1.8rem] shadow-xl shadow-indigo-600/30 active:scale-90 transition-all border-4 border-slate-950 relative -mt-2"
           >
              <Plus size={24} strokeWidth={4} />
           </button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-white/5">
            <button onClick={() => setActiveTab('tracker')} className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'}`}>Treker</button>
            <button onClick={() => setActiveTab('analytics')} className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'}`}>Analitika</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tracker' ? (
          <motion.div key="tracker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex items-center justify-between glass-card p-3 rounded-[2rem] border border-white/5 shadow-2xl">
               <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-indigo-400 active:scale-90 transition-all"><ChevronLeft size={20} /></button>
               <div className="text-center">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-0.5">Monitoring</span>
                  <span className="text-xs font-black text-white uppercase tracking-widest">
                    {weekOffset === 0 ? 'Shu hafta' : weekOffset === -1 ? 'O\'tgan hafta' : `${Math.abs(weekOffset)} h. ${weekOffset > 0 ? 'keyin' : 'oldin'}`}
                  </span>
               </div>
               <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-indigo-400 active:scale-90 transition-all"><ChevronRight size={20} /></button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <AnimatePresence mode="popLayout">
                {habits.map((habit, idx) => {
                  const currentStreak = calculateCurrentStreak(habit.completedDates);
                  const isDoneToday = habit.completedDates.includes(todayStr);
                  
                  return (
                    <motion.div 
                      layout key={habit.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="neo-card rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 shadow-2xl group relative"
                    >
                      <div className="p-6 md:p-8 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 min-w-0 flex-1 cursor-pointer" onClick={() => toggleHabitForDate(habit.id, todayStr)}>
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shrink-0 transition-all duration-500 ${habit.color} ${isDoneToday ? 'ring-4 ring-white/10 active-glow' : 'opacity-40 grayscale'}`}>
                            <Flame size={isDoneToday ? 32 : 24} fill={isDoneToday ? "white" : "none"} strokeWidth={3} />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-black text-xl md:text-2xl tracking-tighter truncate ${isDoneToday ? 'text-white' : 'text-slate-500'}`}>{habit.title}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                                    <Trophy size={10} /> {currentStreak} kunlik seriya
                                </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); if(window.confirm("O'chirishni tasdiqlaysizmi?")) deleteHabit(habit.id); }} className="p-3 text-slate-700 hover:text-rose-500 transition-all bg-white/5 rounded-xl border border-white/5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                <Trash2 size={20} />
                            </button>
                            <button onClick={() => toggleHabitForDate(habit.id, todayStr)} className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] transition-all flex items-center justify-center active:scale-90 shadow-xl ${isDoneToday ? `${habit.color} text-white` : 'bg-slate-950 text-slate-800 border border-white/5'}`}>
                                {isDoneToday ? <CheckCircle2 size={32} strokeWidth={3} /> : <Target size={24} />}
                            </button>
                        </div>
                      </div>

                      <div className="px-6 md:px-8 pb-7 pt-2 border-t border-white/[0.03]">
                        <div className="flex justify-between gap-1.5">
                            {currentWeekDays.map(day => {
                                const done = habit.completedDates.includes(day.dateStr);
                                return (
                                    <button 
                                      key={day.dateStr} onClick={() => toggleHabitForDate(habit.id, day.dateStr)} 
                                      className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-300 border active:scale-90
                                        ${done ? `${habit.color} border-transparent text-white shadow-xl scale-105` : 
                                        day.isToday ? 'border-indigo-500/30 bg-indigo-500/5 text-slate-500' : 'border-white/5 bg-slate-950/40 text-slate-800'}`}
                                    >
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${done ? 'text-white' : 'text-slate-700'}`}>{day.label}</span>
                                        <span className="text-sm font-black">{day.dayNum}</span>
                                    </button>
                                );
                            })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {habits.length === 0 && (
                <div className="text-center py-24 neo-card rounded-[3rem] border-dashed border-white/10 opacity-30 flex flex-col items-center gap-4">
                  <Activity size={64} className="text-slate-600" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Hali odatlar qo'shilmagan</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <HabitAnalytics />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalType && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-end md:justify-center items-center sm:p-4"
            onClick={() => setModalType(null)}
          >
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0F1115] border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] p-10 pb-safe shadow-[0_-20px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[95dvh]"
            >
                <div className="shrink-0 w-full flex items-center justify-center pb-6 md:hidden" onClick={() => setModalType(null)}>
                    <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                </div>

                <div className="flex justify-between items-center mb-10 shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter">{modalType === 'add' ? 'Yangi Odat' : 'Tahrirlash'}</h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Kunlik intizomni boshlang</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="p-3 text-slate-500 bg-white/5 rounded-full hover:text-white transition-all"><X size={24}/></button>
                </div>

                <div className="overflow-y-auto flex-1 pr-1 no-scrollbar space-y-10">
                    <form onSubmit={handleAction} className="space-y-10 pb-20">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Odat nomi</label>
                            <input 
                                autoFocus type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)}
                                placeholder="Masalan: Kitob o'qish"
                                className="w-full p-6 bg-slate-950 rounded-[1.5rem] text-xl font-black text-white outline-none border border-white/5 focus:border-indigo-500/50 transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2 flex items-center gap-2"><Palette size={14}/> Rangni tanlang</label>
                            <div className="flex flex-wrap gap-4">
                                {HABIT_COLORS.map(c => (
                                    <button 
                                        key={c} type="button" onClick={() => setHabitColor(c)}
                                        className={`w-12 h-12 rounded-2xl transition-all active:scale-90 ${c} ${habitColor === c ? 'ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110' : 'opacity-40'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">
                            Saqlash
                        </button>
                    </form>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
