
import React, { useMemo } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  CheckCircle2, ArrowRight, Sun, Moon, Sunrise, Target, Sparkles, Zap, Clock, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GamificationBar } from '../components/GamificationBar';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { BrainDump } from '../components/BrainDump';
import { AIBriefing } from '../components/AIBriefing';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { language, tasks, habits, userName, toggleTask, userProfile } = useApp();
  const t = TRANSLATIONS[language];
  const today = getLocalDate();

  // Salomlashish mantig'ini to'g'irlash
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'uz') {
        if (hour < 5) return { text: 'Xayrli tun', icon: Moon };
        if (hour < 12) return { text: 'Xayrli tong', icon: Sunrise };
        if (hour < 18) return { text: 'Xayrli kun', icon: Sun };
        return { text: 'Xayrli kech', icon: Moon };
    } else {
        if (hour < 5) return { text: 'Доброй ночи', icon: Moon };
        if (hour < 12) return { text: 'Доброе утро', icon: Sunrise };
        if (hour < 18) return { text: 'Добрый день', icon: Sun };
        return { text: 'Добрый вечер', icon: Moon };
    }
  };
  const greeting = getGreeting();

  // Sanani chiroyli formatlash (Bosh harf bilan)
  const getFormattedDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateString = date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', options);
    return dateString.charAt(0).toUpperCase() + dateString.slice(1);
  };

  const todaysTasks = tasks.filter(task => task.date === today);
  const pendingTasks = todaysTasks.filter(task => !task.completed);
  
  // Obuna muddati hisob-kitobi
  const expiryDate = userProfile?.subscription_expires_at ? new Date(userProfile.subscription_expires_at) : null;
  const isExpired = expiryDate ? expiryDate.getTime() < Date.now() : false;
  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Welcome Hero */}
      <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border border-white/5">
          <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-400 mb-6 text-[10px] font-black uppercase tracking-[0.3em]">
                  <Sparkles size={12} className="active-glow" />
                  {getFormattedDate()}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-[1.1] text-white">
                  {greeting.text},<br />
                  <span className="ai-gradient-text capitalize">{userName}!</span>
              </h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-indigo-600/20 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-indigo-500/20">
                      LVL {userProfile?.level || 1}
                  </div>
                  <div className="bg-emerald-500/10 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                      {userProfile?.xp || 0} XP
                  </div>
              </div>

              {/* Subscription Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
                {expiryDate ? (
                  <>
                    {isExpired ? (
                      <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                        <AlertTriangle size={14} /> Hisob bloklangan
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${daysLeft !== null && daysLeft <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                        <Clock size={14} className={daysLeft !== null && daysLeft <= 3 ? 'animate-pulse' : ''} /> 
                        {language === 'uz' ? 'Muddati:' : 'Истекает:'} <span className="text-white ml-1">{expiryDate.toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} /> Cheksiz kirish faol
                  </div>
                )}
              </div>
          </div>
          
          {/* Subtle background icon */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
             <Zap size={240} className="text-indigo-500" />
          </div>
      </div>

      <GamificationBar />
      <AIBriefing />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Tasks Summary */}
          <div className="glass-card p-6 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tighter">{t.todaysFocus}</h3>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{pendingTasks.length} ta reja qoldi</p>
                    </div>
                </div>
                <Link to="/tasks" className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all">
                    <ArrowRight size={20} />
                </Link>
              </div>

              <div className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <div className="py-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/5">
                    <p className="text-slate-600 font-black text-xs uppercase tracking-widest">{t.noTasks}</p>
                  </div>
                ) : (
                  pendingTasks.slice(0, 3).map(task => (
                    <div key={task.id} onClick={() => toggleTask(task.id)} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
                      <div className="w-6 h-6 rounded-lg border-2 border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition-colors"></div>
                      <span className="font-bold text-white text-sm truncate">{task.title}</span>
                    </div>
                  ))
                )}
              </div>
          </div>

          <div className="flex flex-col gap-6">
              <PomodoroTimer />
              <BrainDump />
          </div>
      </div>
    </motion.div>
  );
};
