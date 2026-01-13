
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { LogOut, Send, ShieldAlert, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const SubscriptionGuard = ({ children }: { children?: React.ReactNode }) => {
  const { hasAccess, session, signOut, language, userProfile, isLoading } = useApp();
  const t = TRANSLATIONS[language];

  if (isLoading || (session && !userProfile)) {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-950">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  // hasAccess endi faqat is_active holatiga qaraydi
  if (session && !hasAccess) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[999] flex items-center justify-center p-6 pt-safe">
        <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-[200%] h-[200%] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-1/4 right-1/4 w-[200%] h-[200%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm glass-card p-8 rounded-[3rem] border border-white/10 text-center relative z-10 shadow-2xl"
        >
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-500/20 shadow-2xl">
                <ShieldAlert size={40} className="drop-shadow-glow" />
            </div>

            <h2 className="text-3xl font-black text-white tracking-tighter mb-4 leading-none">
                {t.subscriptionExpired}
            </h2>
            
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10 px-2">
                {t.subscriptionDesc}
            </p>

            <div className="space-y-3">
                <a 
                    href="https://t.me/akramov_azamat1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-[0_15px_40px_-10px_rgba(79,70,229,0.5)] active:scale-[0.97] transition-all"
                >
                    <Send size={18} />
                    {t.subscribeTelegram}
                </a>
                
                <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900/50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-white/10 active:scale-[0.97] transition-all hover:bg-slate-900"
                >
                    <LogOut size={18} />
                    {t.signOut}
                </button>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 opacity-60">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <AlertCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{t.contactAdmin}</span>
                </div>
                <div className="w-12 h-1 bg-white/5 rounded-full"></div>
            </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
