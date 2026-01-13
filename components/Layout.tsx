
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, APP_CONFIG } from '../constants';
import { 
  LayoutDashboard, Calendar, CheckSquare, Activity, LogOut, Shield, User, Mic, Sparkles, Wallet
} from 'lucide-react';
import { SubscriptionGuard } from './SubscriptionGuard';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { language, signOut, isAdmin } = useApp();
  const t = TRANSLATIONS[language];

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
          isActive 
            ? 'bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-600' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-indigo-300'
        }`
      }
    >
      <Icon size={22} />
      <span className="font-bold tracking-tight">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-950 text-slate-100 overflow-hidden relative">
      
      {/* Mobile Header - Fixed at top */}
      <div className="md:hidden px-6 py-3 flex justify-between items-center bg-slate-950/90 backdrop-blur-2xl border-b border-white/5 z-40 pt-safe shrink-0 absolute top-0 left-0 right-0 h-[60px] md:h-auto">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="text-white" size={16} />
           </div>
           <h1 className="text-lg font-black tracking-tighter">{APP_CONFIG.name}<span className="text-indigo-500">{APP_CONFIG.suffix}</span></h1>
        </div>
        <NavLink to="/profile" className="w-10 h-10 rounded-xl bg-slate-900/50 flex items-center justify-center text-indigo-400 border border-white/10 active:scale-95 transition-transform overflow-hidden">
            <User size={18} />
        </NavLink>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full p-8 z-50 border-r border-white/5 bg-slate-950 shrink-0">
        <div className="mb-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl">
                <Sparkles className="text-white" size={24} />
             </div>
             <h1 className="text-2xl font-black tracking-tighter">{APP_CONFIG.name}<span className="text-indigo-500">{APP_CONFIG.suffix}</span></h1>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <NavItem to="/" icon={LayoutDashboard} label={t.dashboard} />
          <NavItem to="/ai-planner" icon={Mic} label={t.aiPlanner} />
          <NavItem to="/tasks" icon={CheckSquare} label={t.tasks} />
          <NavItem to="/finance" icon={Wallet} label={t.finance} />
          <NavItem to="/calendar" icon={Calendar} label={t.calendar} />
          <NavItem to="/habits" icon={Activity} label={t.habits} />
          <div className="h-px bg-white/5 my-8"></div>
          <NavItem to="/profile" icon={User} label={t.profile} />
          {isAdmin && <NavItem to="/admin" icon={Shield} label={t.adminPanel} />}
        </nav>

        <button onClick={() => signOut()} className="flex items-center space-x-4 px-5 py-4 w-full rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all mt-auto shrink-0">
          <LogOut size={20} />
          <span className="font-bold">{t.signOut}</span>
        </button>
      </aside>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 h-full w-full overflow-hidden flex flex-col relative pt-[60px] md:pt-0 pb-[80px] md:pb-0">
        <div className="flex-1 overflow-y-auto scroll-container w-full h-full pb-safe">
            <div className="max-w-4xl mx-auto p-4 md:p-12 min-h-full">
              <SubscriptionGuard>
                {children}
              </SubscriptionGuard>
            </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-3xl border-t border-white/10 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center h-[65px] px-4 max-w-sm mx-auto">
            <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}>
                {({isActive}) => <LayoutDashboard size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>
            
            <NavLink to="/tasks" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}>
                {({isActive}) => <CheckSquare size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>
            
            {/* AI Planner (Center) */}
            <div className="relative w-16 h-16 -mt-10 flex items-center justify-center pointer-events-none">
               <div className="absolute inset-0 bg-slate-950 rounded-full -m-2 pointer-events-auto"></div>
               <NavLink 
                to="/ai-planner" 
                className={({isActive}) => `pointer-events-auto relative z-10 w-14 h-14 bg-indigo-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-[0_8px_25px_rgba(79,70,229,0.5)] active:scale-90 transition-all ${isActive ? 'bg-indigo-500 ring-4 ring-indigo-500/20' : ''}`}
               >
                <Mic size={26} />
               </NavLink>
            </div>

            <NavLink to="/finance" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}>
                {({isActive}) => <Wallet size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>
            
            <NavLink to="/calendar" className={({isActive}) => `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}>
                {({isActive}) => <Calendar size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>
        </div>
      </div>
    </div>
  );
};
