
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Trophy, Star, Sparkles } from 'lucide-react';

export const GamificationBar = () => {
  const { language, userProfile } = useApp();
  const t = TRANSLATIONS[language];
  
  const xp = userProfile?.xp || 0;
  const level = userProfile?.level || 1;
  const xpForNextLevel = 100;
  const currentLevelProgress = xp % 100;
  const percentage = Math.min(100, (currentLevelProgress / xpForNextLevel) * 100);

  return (
    <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 relative">
                    <span className="text-3xl font-black">{level}</span>
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-xl p-1.5 shadow-xl">
                        <Star size={14} fill="currentColor" />
                    </div>
                </div>
                <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tight">Level Up</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{xp % 100} / 100 XP</p>
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-indigo-600">
                <Trophy size={24} />
            </div>
        </div>

        <div className="space-y-4">
             <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                 <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    style={{ width: `${percentage}%` }}
                 />
             </div>
             <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span className="flex items-center gap-1"><Sparkles size={12}/> {xp} Jami XP</span>
                 <span className="text-indigo-600 dark:text-indigo-400">{100 - (xp % 100)} XP keyingi darajaga</span>
             </div>
        </div>
    </div>
  );
};
