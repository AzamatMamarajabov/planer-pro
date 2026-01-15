
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = language === 'uz' 
      ? { night: 'Xayrli tun', morning: 'Xayrli tong', afternoon: 'Xayrli kun', evening: 'Xayrli kech' }
      : { night: 'Доброй ночи', morning: 'Доброе утро', afternoon: 'Добрый день', evening: 'Добрый вечер' };

    if (hour < 5) return { text: greetings.night, icon: Moon };
    if (hour < 12) return { text: greetings.morning, icon: Sunrise };
    if (hour < 18) return { text: greetings.afternoon, icon: Sun };
    return { text: greetings.evening, icon: Moon };
  };
  const greeting = getGreeting();

  const todaysTasks = tasks.filter(task => task.date === today);
  const pendingTasks = todaysTasks.filter(task => !task.completed);
  
  const expiryDate = userProfile?.subscription_expires_at ? new Date(userProfile.subscription_expires_at) : null;
  const isExpired = expiryDate ? expiryDate.getTime() < Date.now() : false;
  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      
      {/* Hero Section */}
      <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
          <div className="glass-card rounded-[3rem] p-8 md:p-10 relative overflow-hidden border border-white/10">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                      <div className="flex items-center gap-2 text-indigo-400 mb-4 text-[10px] font-black uppercase tracking-[0.3em] bg-indigo-500/10 px-3 py-1.5 rounded-lg w-fit backdrop-blur-md">
                          <greeting.icon size={12} className="text-yellow-400" />
                          {new Date().toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      
                      <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-white leading-[0.9]">
                          {greeting.text}, <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{userName}</span>
                      </h1>
                  </div>

                  {/* Level Badge */}
                  <div className="flex items-center gap-3">
                      <div className="px-5 py-3 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col items-center min-w-[80px]">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.levelLabel}</span>
                          <span className="text-2xl font-black text-white">{userProfile?.level || 1}</span>
                      </div>
                      <div className="px-5 py-3 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col items-center min-w-[80px]">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.xpLabel}</span>
                          <span className="text-2xl font-black text-amber-400">{userProfile?.xp || 0}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <GamificationBar />
      <AIBriefing />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Tasks Focus Card */}
          <div className="glass-card p-8 rounded-[3rem] border border-white/5 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Target size={24} className="text-rose-500" />
                        {t.todaysFocus}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-1 ml-9">{pendingTasks.length} {t.remaining}</p>
                </div>
                <Link to="/tasks" className="p-4 bg-white/5 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-90">
                    <ArrowRight size={20} />
                </Link>
              </div>

              <div className="space-y-3 flex-1">
                {pendingTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Sparkles size={40} className="mb-4 text-slate-400" />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{t.allClear}</p>
                  </div>
                ) : (
                  pendingTasks.slice(0, 4).map(task => (
                    <motion.div 
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.7)" }}
                        whileTap={{ scale: 0.98 }}
                        key={task.id} 
                        onClick={() => toggleTask(task.id)} 
                        className="flex items-center gap-4 p-5 bg-slate-900/40 rounded-[1.5rem] border border-white/5 cursor-pointer group transition-all"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-slate-700 group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="font-bold text-slate-200 text-sm truncate">{task.title}</span>
                      {task.priority === 'high' && <div className="ml-auto w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
                    </motion.div>
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
