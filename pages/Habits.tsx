
import React, { useState, useMemo } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS, HABIT_COLORS } from '../constants';
import { 
  Plus, CheckCircle2, Flame, Trash2, LayoutGrid, Zap, Target, 
  ChevronLeft, ChevronRight, Activity, X 
} from 'lucide-react';
import { HabitAnalytics } from '../components/HabitAnalytics';
import { motion, AnimatePresence } from 'framer-motion';

export const HabitsPage = () => {
  const { language, habits, addHabit, deleteHabit, toggleHabitForDate } = useApp();
  const t = TRANSLATIONS[language];
  const [newHabitName, setNewHabitName] = useState('');
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');
  const [weekOffset, setWeekOffset] = useState(0); 
  const todayStr = getLocalDate(new Date());

  const getMonthName = (date: Date) => date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'short' });

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
        label: d.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' }).toUpperCase(),
        dayNum: d.getDate(),
        month: getMonthName(d)
      });
    }
    return days;
  }, [language, weekOffset]);

  const weekLabel = useMemo(() => {
    const start = currentWeekDays[0];
    const end = currentWeekDays[6];
    return `${start.dayNum} ${start.month} - ${end.dayNum} ${end.month}`;
  }, [currentWeekDays]);

  const handleAdd = () => {
    if(!newHabitName.trim()) return;
    addHabit({
      id: Math.random().toString(36).substr(2, 9),
      title: newHabitName, streak: 0, completedDates: [],
      color: HABIT_COLORS[habits.length % HABIT_COLORS.length]
    });
    setNewHabitName('');
  };

  return (
    <div className="max-w-5xl mx-auto px-2 md:px-4 pb-40 space-y-6 md:space-y-8 pt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="space-y-1">
           <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Odatlar <span className="ai-gradient-text">Lab</span></h2>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Haftalik Monitoring v4.2</p>
        </div>
        <div className="grid grid-cols-2 bg-slate-800/40 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
          <button onClick={() => setActiveTab('tracker')} className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 ${activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}><LayoutGrid size={16} /> Treker</button>
          <button onClick={() => setActiveTab('analytics')} className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}><Activity size={16} /> Analitika</button>
        </div>
      </div>

      {activeTab === 'tracker' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between glass-panel p-2 px-2 rounded-[2rem] border border-white/5 mx-2">
             <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-4 bg-white/5 rounded-2xl text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
             <div className="text-center px-4"><span className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-widest">{weekLabel}</span></div>
             <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-4 bg-white/5 rounded-2xl text-slate-400 active:scale-90 transition-transform"><ChevronRight size={24} /></button>
          </div>

          <div className="relative group px-2">
            <div className={`flex items-center gap-3 glass-panel p-2 pl-4 md:pl-6 rounded-[2rem] border border-white/5 transition-all ${newHabitName ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10' : ''}`}>
              <Zap size={24} className={newHabitName ? "text-indigo-400 animate-pulse" : "text-slate-700"} />
              <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder={t.newHabit} className="flex-1 bg-transparent border-none outline-none py-4 text-white font-bold placeholder:text-slate-700 text-base md:text-lg" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              <button onClick={handleAdd} disabled={!newHabitName.trim()} className={`p-4 rounded-full transition-all active:scale-90 ${newHabitName ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-800 text-slate-600'}`}><Plus size={24} /></button>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <AnimatePresence mode="popLayout">
            {habits.map(habit => {
              const isDoneToday = habit.completedDates.includes(todayStr);
              return (
                <motion.div layout key={habit.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="neo-card rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 shadow-2xl">
                  <div className="p-5 md:p-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 cursor-pointer" onClick={() => toggleHabitForDate(habit.id, todayStr)}>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 ${habit.color} ${isDoneToday ? 'active-glow' : ''}`}><Flame size={20} fill={isDoneToday ? "white" : "none"} /></div>
                      <div className="min-w-0">
                        <h3 className="font-black text-white text-base md:text-lg truncate leading-tight">{habit.title}</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{habit.streak} kunlik zanjir</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if(window.confirm(language === 'uz' ? "Ushbu odatni o'chirib tashlamoqchimisiz?" : "Удалить эту привычку?")) {
                                  deleteHabit(habit.id); 
                                }
                            }} 
                            className="p-3 text-slate-700 hover:text-rose-500 active:scale-90 transition-all bg-white/5 rounded-xl relative z-10"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button onClick={() => toggleHabitForDate(habit.id, todayStr)} className={`p-3 md:p-4 rounded-2xl transition-all active:scale-90 ${isDoneToday ? `${habit.color} text-white shadow-lg` : 'bg-white/5 text-slate-600'}`}>
                            {isDoneToday ? <CheckCircle2 size={24} strokeWidth={3} /> : <Target size={24} />}
                        </button>
                    </div>
                  </div>
                  <div className="px-4 md:px-6 pb-6 md:pb-8 pt-2">
                    <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                        {currentWeekDays.map(day => {
                            const done = habit.completedDates.includes(day.dateStr);
                            const isToday = day.dateStr === todayStr;
                            return (
                                <div key={day.dateStr} className="flex flex-col items-center gap-1.5 md:gap-2">
                                    <span className={`text-[8px] md:text-[9px] font-black tracking-tighter ${isToday ? 'text-indigo-400' : 'text-slate-600'}`}>{day.label}</span>
                                    <button onClick={() => toggleHabitForDate(habit.id, day.dateStr)} className={`w-full aspect-square max-w-[48px] rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 border relative active:scale-90 ${done ? `${habit.color} border-transparent text-white shadow-lg scale-105 z-10` : isToday ? 'border-indigo-500/30 bg-indigo-500/5 text-slate-400' : 'border-white/5 bg-slate-900/50 text-slate-800'}`}>
                                        <span className="text-xs md:text-sm font-black leading-none">{day.dayNum}</span>
                                        {done && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-sm"><CheckCircle2 size={8} className="text-current" /></div>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
            {habits.length === 0 && (
                <div className="text-center py-20 neo-card rounded-[2.5rem] border-dashed border-white/10 opacity-30 mx-2">
                  <Activity size={48} className="mx-auto mb-4 text-slate-500" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">Hozircha odatlar yo'q</p>
                </div>
            )}
          </div>
        </div>
      ) : <HabitAnalytics />}
      <div className="text-center pb-20"><p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.4em]">Habit Engine v4.2 • Mobile First</p></div>
    </div>
  );
};
