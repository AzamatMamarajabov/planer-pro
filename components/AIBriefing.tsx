
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateDailyBriefing } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIBriefing = () => {
  const { language, tasks } = useApp();
  const t = TRANSLATIONS[language];
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateDailyBriefing(tasks, language);
    setBriefing(result);
    setLoading(false);
  };

  return (
    <div className="glass-card p-1.5 rounded-[3rem] border border-white/10">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-[2.8rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600/30 rounded-2xl border border-indigo-400/20 backdrop-blur-xl">
                            <Zap size={24} className="fill-yellow-400 text-yellow-400 active-glow" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl tracking-tighter">{t.dailyBriefing}</h3>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-0.5">Gemini Engine v2.0</p>
                        </div>
                    </div>
                    {briefing && (
                        <button onClick={handleGenerate} disabled={loading} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90 border border-white/5">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    )}
                </div>
                
                <AnimatePresence mode="wait">
                    {!briefing && !loading ? (
                        <motion.div 
                          key="initial"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex flex-col items-center py-6"
                        >
                            <button 
                                onClick={handleGenerate}
                                className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] text-lg font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition active:scale-95 flex items-center gap-4"
                            >
                                <Sparkles size={24} /> {t.generateBriefing}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div 
                          key="content"
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-950/40 rounded-[2.5rem] p-8 backdrop-blur-2xl border border-white/5 text-lg leading-relaxed text-slate-200 min-h-[140px] font-bold"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-6 py-8">
                                    <div className="flex gap-3">
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" />
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">{t.briefingLoading}</p>
                                </div>
                            ) : briefing}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};
