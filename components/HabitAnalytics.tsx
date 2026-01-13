import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, Cell
} from 'recharts';
import { Flame, Trophy, CalendarCheck, TrendingUp, Zap, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const HabitAnalytics = () => {
  const { language, habits } = useApp();
  const t = TRANSLATIONS[language];

  const successRateData = habits.map(h => {
    const totalCompletions = h.completedDates.length;
    const rate = Math.min(100, Math.round((totalCompletions / 30) * 100));
    return { name: h.title, rate, color: h.color };
  }).sort((a, b) => b.rate - a.rate);

  const last30DaysData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    let count = 0;
    habits.forEach(h => { if (h.completedDates.includes(dateStr)) count++; });
    return { date: d.getDate(), count };
  });

  const totalLogs = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const bestStreak = Math.max(...habits.map(h => h.streak), 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Bento Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2rem] shadow-2xl text-white">
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Loglar</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black">{totalLogs}</h3>
            <Zap size={24} className="opacity-40" />
          </div>
        </div>

        <div className="neo-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-500">Eng yaxshi</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-white">{bestStreak} <span className="text-[10px] text-orange-400">kun</span></h3>
            <Flame size={20} className="text-orange-500 opacity-50" />
          </div>
        </div>

        <div className="neo-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-500">Odatlar</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-white">{habits.length}</h3>
            <Target size={20} className="text-emerald-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Main Charts - Responsive Height */}
      <div className="space-y-6">
        <div className="neo-card p-6 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-2 mb-6">
             <TrendingUp size={16} className="text-indigo-400" />
             <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{t.last30Days}</h3>
          </div>
          <div className="h-[200px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30DaysData}>
                <defs>
                  <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 8, fill: '#475569'}} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fill="url(#colorPulse)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success List - Mobile Optimized */}
        <div className="neo-card p-6 rounded-[2.5rem] border border-white/5">
           <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
             <Award size={16} className="text-amber-500" /> Muvaffaqiyat ko'rsatkichi
           </h3>
           <div className="space-y-4">
              {successRateData.map((habit, idx) => (
                  <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-white truncate pr-4">{habit.name}</span>
                          <span className="text-slate-500">{habit.rate}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${habit.rate}%` }}
                            className={`h-full rounded-full ${habit.color}`}
                          />
                      </div>
                  </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};