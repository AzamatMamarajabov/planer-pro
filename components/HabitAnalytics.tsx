
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';
import { Flame, Trophy, CalendarCheck, TrendingUp, Zap, Target, Award, CheckCircle2, Star, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const HabitAnalytics = () => {
  const { language, habits } = useApp();
  const t = TRANSLATIONS[language];

  // Consistency Index: Last 30 days
  const successRateData = habits.map(h => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const lastMonthCompletions = h.completedDates.filter(d => new Date(d) >= thirtyDaysAgo).length;
    const rate = Math.min(100, Math.round((lastMonthCompletions / 30) * 100));
    return { name: h.title, rate, color: h.color, total: h.completedDates.length };
  }).sort((a, b) => b.rate - a.rate);

  const last14DaysData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    let count = 0;
    habits.forEach(h => { if (h.completedDates.includes(dateStr)) count++; });
    return { 
      day: d.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' }), 
      count,
      fullDate: dateStr
    };
  });

  const totalLogs = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0), 0) : 0;
  
  const totalPotential = habits.length * 14;
  const actualCompletions = last14DaysData.reduce((acc, d) => acc + d.count, 0);
  const consistencyScore = totalPotential > 0 ? Math.round((actualCompletions / totalPotential) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Overview Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group border border-white/10"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Zap size={120} fill="white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Consistency Index</p>
                <h3 className="text-6xl font-black tabular-nums tracking-tighter">{consistencyScore}%</h3>
                <p className="text-xs font-bold text-indigo-200">Oxirgi 14 kunlik faollik darajasi</p>
            </div>
            <div className="flex gap-4">
                 <div className="px-5 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-1">Max Streak</p>
                    <p className="text-2xl font-black text-white">{bestStreak}d</p>
                 </div>
                 <div className="px-5 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-1">Total Logs</p>
                    <p className="text-2xl font-black text-white">{totalLogs}</p>
                 </div>
            </div>
        </div>
      </motion.div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <div className="neo-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
             <TrendingUp size={14} className="text-indigo-400" /> Faollik Trendi
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last14DaysData}>
                <defs>
                  <linearGradient id="colorIdx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '10px' }}
                    labelStyle={{ color: '#64748b', fontWeight: 800, fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fill="url(#colorIdx)" activeDot={{ r: 4, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Performance */}
        <div className="neo-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target size={14} className="text-indigo-400" /> Odatlar bo'yicha
           </h3>
           <div className="space-y-4 max-h-[200px] overflow-y-auto no-scrollbar">
              {successRateData.map((h, i) => (
                  <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="truncate pr-4">{h.name}</span>
                          <span className="text-white">{h.rate}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${h.rate}%` }} className={`h-full ${h.color} rounded-full`} />
                      </div>
                  </div>
              ))}
              {habits.length === 0 && <p className="text-center text-xs font-bold text-slate-700 py-10">Ma'lumotlar yo'q</p>}
           </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="neo-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <CalendarCheck size={14} className="text-indigo-400" /> Oxirgi 14 kunlik Heatmap
         </h3>
         <div className="flex justify-between items-center px-1">
             {last14DaysData.map((day, idx) => {
                 const opacity = day.count === 0 ? 0.05 : Math.max(0.2, (day.count / (habits.length || 1)));
                 return (
                     <div key={idx} className="flex flex-col items-center gap-1.5">
                         <div 
                            className="w-5 h-5 md:w-8 md:h-8 rounded-md md:rounded-lg border border-white/5 transition-transform hover:scale-110"
                            style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
                            title={`${day.day}: ${day.count}ta`}
                         />
                         <span className="text-[7px] font-black text-slate-600 uppercase">{day.day.split(' ')[0]}</span>
                     </div>
                 );
             })}
         </div>
      </div>

    </div>
  );
};
