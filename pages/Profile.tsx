
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  User, CreditCard, LogOut, Globe, Shield, Zap, CheckCircle2, 
  Activity, Calendar, Sparkles, Trophy, Crown, Clock, ShieldCheck, 
  AlertTriangle, Wallet, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage = () => {
  const { 
    userProfile, 
    session, 
    language, 
    setLanguage, 
    signOut,
    tasks,
    habits
  } = useApp();
  const t = TRANSLATIONS[language];

  const totalTasksCompleted = tasks.filter(t => t.completed).length;
  const activeHabitsCount = habits.length;
  const registrationDate = session?.user?.created_at 
    ? new Date(session.user.created_at).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';
  
  const xp = userProfile?.xp || 0;
  const level = userProfile?.level || 1;
  const xpForNextLevel = 100;
  const progressPercent = Math.min(100, ((xp % 100) / xpForNextLevel) * 100);

  const expiryDate = userProfile?.subscription_expires_at ? new Date(userProfile.subscription_expires_at) : null;
  const isExpired = expiryDate ? expiryDate.getTime() < Date.now() : false;
  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-32 pt-6 px-2"
    >
      <div className="flex items-center gap-5 px-4 mb-4">
        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <User size={32} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">{t.profile}</h2>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">{t.accountSettings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
            <motion.div variants={itemVariants} className="neo-card p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-20"></div>
                <div className="relative z-10 pt-4">
                    <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-white/5 p-1 shadow-2xl mx-auto active-glow overflow-hidden">
                        <div className="w-full h-full rounded-full bg-indigo-600/20 flex items-center justify-center text-4xl font-black text-indigo-400 uppercase">
                             {session?.user?.email?.charAt(0) || 'U'}
                        </div>
                    </div>
                    <h3 className="mt-5 font-black text-2xl text-white tracking-tighter truncate max-w-[220px] mx-auto">
                        {session?.user?.email?.split('@')[0]}
                    </h3>
                    <p className="text-slate-500 font-medium text-xs mb-4 truncate w-full px-4">{session?.user?.email}</p>
                    <div className="flex items-center justify-center gap-3">
                         {userProfile?.role === 'admin' ? (
                             <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                 <Shield size={12} /> Admin
                             </span>
                         ) : (
                             <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                 Pro User
                             </span>
                         )}
                    </div>
                </div>
            </motion.div>

            {/* FinanceHub Promo */}
            <motion.div variants={itemVariants} className="relative group">
                <Link to="/finance" className="block p-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 border border-white/10 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform">
                    <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Wallet size={100} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                             <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                 <Wallet size={24} className="text-emerald-100" />
                             </div>
                             <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">Yangi</span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter mb-1">FinanceHub</h3>
                        <p className="text-emerald-100 text-xs font-bold mb-6 opacity-80 max-w-[150px]">Mukammal Moliya Boshqaruvi</p>
                        
                        <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-black/20 self-start inline-flex px-4 py-3 rounded-xl backdrop-blur-sm">
                            Kirish <ArrowRight size={14} />
                        </div>
                    </div>
                </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="neo-card p-6 rounded-[2.5rem] border border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Globe size={16} className="text-indigo-400" /> {t.appLanguage}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setLanguage('uz')} className={`flex items-center justify-between p-4 rounded-2xl border ${language === 'uz' ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-900/50 text-slate-500 border-white/5'}`}>
                        <span className="font-black text-sm uppercase">O'zbekcha</span>
                        {language === 'uz' && <CheckCircle2 size={18} />}
                    </button>
                    <button onClick={() => setLanguage('ru')} className={`flex items-center justify-between p-4 rounded-2xl border ${language === 'ru' ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-900/50 text-slate-500 border-white/5'}`}>
                        <span className="font-black text-sm uppercase">Русский</span>
                        {language === 'ru' && <CheckCircle2 size={18} />}
                    </button>
                </div>
            </motion.div>
            
            <motion.button variants={itemVariants} onClick={() => signOut()} className="w-full p-5 rounded-[1.8rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-transform">
                <LogOut size={20} /> {t.signOut}
            </motion.button>
        </div>

        <div className="md:col-span-2 space-y-6">
            <motion.div variants={itemVariants} className="neo-card p-6 md:p-8 rounded-[2.5rem] border border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <Activity size={18} className="text-indigo-400" /> {t.statistics}
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">{t.level}</p>
                        <p className="text-3xl font-black text-indigo-400">{level}</p>
                    </div>
                    <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">{t.xp}</p>
                        <p className="text-3xl font-black text-amber-500">{xp}</p>
                    </div>
                    <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">{t.totalTasks}</p>
                        <p className="text-3xl font-black text-emerald-500">{totalTasksCompleted}</p>
                    </div>
                    <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">{t.activeHabits}</p>
                        <p className="text-3xl font-black text-purple-500">{activeHabitsCount}</p>
                    </div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Trophy size={14} className="text-amber-500" /> XP Progress
                        </span>
                        <span className="text-indigo-400 font-black text-sm">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-1">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden border border-white/10 group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                         <div className="flex items-center gap-3">
                             <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                                {expiryDate ? <CreditCard size={24} className="text-amber-400" /> : <ShieldCheck size={24} className="text-emerald-400" />}
                             </div>
                             <span className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">{t.subscriptionPlan}</span>
                         </div>
                         <h3 className="text-4xl font-black tracking-tighter">
                            {expiryDate ? 'Pro Subscription' : 'Unlimited Access'}
                         </h3>
                         
                         {expiryDate ? (
                             <div className="space-y-1">
                                <p className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${isExpired ? 'text-rose-400' : daysLeft !== null && daysLeft <= 3 ? 'text-amber-300' : 'text-indigo-200'}`}>
                                    {isExpired ? <AlertTriangle size={16}/> : <Clock size={16}/>}
                                    {isExpired ? 'Hisob muddati tugagan' : `Amal qilish muddati: ${expiryDate.toLocaleDateString()}`}
                                </p>
                                {!isExpired && daysLeft !== null && daysLeft <= 7 && (
                                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Foydalanish uchun {daysLeft} kun qoldi</p>
                                )}
                             </div>
                         ) : (
                             <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest">Cheksiz foydalanish huquqi faol</p>
                         )}
                    </div>
                    <div className="hidden md:block">
                        <Crown size={80} className="text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300/60 gap-4">
                    <div className="flex items-center gap-3">
                        <Calendar size={16} />
                        <span>Ro'yxatdan o'tgan sana: <span className="text-white">{registrationDate}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="active-glow" /> Planner Pro AI
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
