
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, APP_CONFIG } from '../constants';
import { 
  LayoutDashboard, Calendar, CheckSquare, Activity, LogOut, Shield, User, Mic, Sparkles, Wallet
} from 'lucide-react';
import { SubscriptionGuard } from './SubscriptionGuard';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { language, signOut, isAdmin, session, isModalActive } = useApp();
  const t = TRANSLATIONS[language];

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon size={20} className="relative z-10" />
      <span className="font-bold tracking-tight text-sm relative z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
    </NavLink>
  );

  return (
    <div className="flex flex-col md:flex-row h-dvh w-full overflow-hidden relative">
      
      {/* 🚀 PERFECTED PREMIUM MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[100] px-4 pt-safe pb-2">
         {/* Glassmorphism Background with ultra-blur */}
         <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl pointer-events-none" />
         
         <div className="relative z-10 flex justify-between items-center py-3">
             {/* Branding Area: PlanifyAI joined as requested */}
             <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer">
                 <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
                    <Sparkles className="text-white fill-white/20" size={20} strokeWidth={2.5} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20" />
                 </div>

                 <div className="flex flex-col -space-y-1">
                    <h1 className="text-xl font-black tracking-tighter text-white">
                      Planify<span className="text-indigo-500 italic">AI</span>
                    </h1>
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">{t.proAssistant}</span>
                    </div>
                 </div>
             </div>

             {/* Profile Area: Clean User Icon, no extra marks */}
             <NavLink to="/profile">
                <motion.div 
                    whileTap={{ scale: 0.9 }}
                    className="relative group"
                >
                    <div className="w-11 h-11 rounded-2xl bg-slate-900/50 border border-white/10 shadow-xl flex items-center justify-center overflow-hidden transition-all group-active:border-indigo-500/50 group-active:bg-slate-900 backdrop-blur-md">
                        <User size={22} className="text-indigo-400 group-active:text-white transition-colors" strokeWidth={2.5} />
                    </div>
                </motion.div>
             </NavLink>
         </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] h-full p-6 z-50 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl shrink-0">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="text-white fill-white/20" size={20} />
             </div>
             <h1 className="text-xl font-black tracking-tighter text-white">Planify<span className="text-indigo-500">AI</span></h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-2">
          <p className="px-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 mt-2">{t.menuHeader}</p>
          <NavItem to="/" icon={LayoutDashboard} label={t.dashboard} />
          <NavItem to="/ai-planner" icon={Mic} label={t.aiPlanner} />
          <NavItem to="/tasks" icon={CheckSquare} label={t.tasks} />
          <NavItem to="/finance" icon={Wallet} label={t.finance} />
          <NavItem to="/calendar" icon={Calendar} label={t.calendar} />
          <NavItem to="/habits" icon={Activity} label={t.habits} />
          
          <div className="my-6 border-t border-white/5"></div>
          <p className="px-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{t.accountHeader}</p>
          <NavItem to="/profile" icon={User} label={t.profile} />
          {isAdmin && <NavItem to="/admin" icon={Shield} label={t.adminPanel} />}
        </nav>

        <button onClick={() => signOut()} className="flex items-center space-x-3 px-5 py-3.5 w-full rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all mt-auto shrink-0 group border border-transparent hover:border-rose-500/20">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">{t.signOut}</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full w-full overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto scroll-container w-full h-full pb-[110px] md:pb-0 pt-[90px] md:pt-0">
            <div className="max-w-5xl mx-auto p-4 md:p-10 min-h-full">
              <SubscriptionGuard>
                {children}
              </SubscriptionGuard>
            </div>
            <div className="h-safe-bottom w-full md:hidden"></div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden when modal is active */}
      <AnimatePresence>
        {!isModalActive && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="md:hidden fixed bottom-6 left-4 right-4 z-[90] pb-safe pointer-events-none"
          >
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2.5 flex justify-between items-center max-w-sm mx-auto pointer-events-auto">
                <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-[1.6rem] transition-all active:scale-90 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
                    <LayoutDashboard size={20} />
                </NavLink>
                
                <NavLink to="/habits" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-[1.6rem] transition-all active:scale-90 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
                    <Activity size={20} />
                </NavLink>
                
                <NavLink 
                    to="/ai-planner" 
                    className={({isActive}) => `w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 active:scale-90 transition-all relative z-10 -mt-12 border-4 border-slate-950 ${isActive ? 'active-glow' : ''}`}
                >
                    <Mic size={28} />
                </NavLink>

                <NavLink to="/finance" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-[1.6rem] transition-all active:scale-90 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
                    <Wallet size={20} />
                </NavLink>
                
                <NavLink to="/calendar" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-[1.6rem] transition-all active:scale-90 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
                    <Calendar size={20} />
                </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
