
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, APP_CONFIG } from '../constants';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, KeyRound, AlertCircle, Send, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
  forcedView?: 'login' | 'signup' | 'forgot' | 'reset';
}

export const Auth = ({ forcedView }: AuthProps) => {
  const { language, setLanguage } = useApp();
  const t = TRANSLATIONS[language];
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'reset'>(forcedView || 'login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Tashqaridan rejim o'zgarsa (masalan App.tsx dan 'reset' kelsa)
  useEffect(() => {
    if (forcedView) {
      setView(forcedView);
      if (forcedView === 'reset') {
        setEmailSent(false); // Link bosilganda "email yuborildi" oynasini yopish
      }
    }
  }, [forcedView]);

  // URL hash orqali reset view ni aniqlash (redunant check)
  useEffect(() => {
    if (window.location.hash.includes('access_token') || window.location.hash.includes('recovery')) {
      setView('reset');
      setEmailSent(false);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured) {
      setError("Supabase not configured.");
      return;
    }

    setLoading(true);

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, password, options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        setSuccess(language === 'uz' ? "Tasdiqlash xati yuborildi!" : "Письмо подтверждения отправлено!");
      } else if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#type=recovery`,
        });
        if (error) throw error;
        setEmailSent(true);
        setSuccess(language === 'uz' ? "Tiklash havolasi yuborildi!" : "Ссылка для восстановления отправлена!");
      } else if (view === 'reset') {
        // YANGI PAROLNI SAQLASH
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setSuccess(language === 'uz' ? "Parol saqlandi! Yuklanmoqda..." : "Пароль сохранен! Загрузка...");
        // App.tsx'dagi USER_UPDATED tinglovchisi Dashboardga o'tkazadi
      }
    } catch (err: any) {
      setError(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (view === 'forgot') return language === 'uz' ? "Parolni tiklash" : "Восстановление";
    if (view === 'reset') return language === 'uz' ? "Yangi parol o'rnatish" : "Новый пароль";
    return view === 'login' ? t.login : t.signup;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none"></div>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] glass-card rounded-[3.5rem] border border-white/10 p-8 md:p-12 space-y-8 relative shadow-2xl z-10"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-5 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[1.8rem] mb-4 shadow-xl border border-white/10 ring-4 ring-indigo-500/10">
              <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {APP_CONFIG.name}<span className="text-indigo-500">{APP_CONFIG.suffix}</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">{getTitle()}</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold rounded-2xl text-center flex items-center justify-center gap-2 overflow-hidden"
            >
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}
          {success && !emailSent && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold rounded-2xl text-center flex items-center justify-center gap-2 overflow-hidden"
            >
              <CheckCircle2 size={14} /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {emailSent && view === 'forgot' ? (
          <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 shadow-inner">
                <Send size={32} className="text-indigo-400 animate-bounce" />
             </div>
             <div className="space-y-2">
                <h3 className="text-white font-black text-lg">{language === 'uz' ? "Link yuborildi!" : "Ссылка отправлена!"}</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed px-4">
                  {language === 'uz' 
                    ? `Biz ${email} manziliga tiklash havolasini yubordik. Emailingizni tekshiring.` 
                    : `Мы отправили ссылку для восстановления на ${email}. Проверьте почту.`}
                </p>
             </div>
             <button onClick={() => { setEmailSent(false); setView('login'); }} className="flex items-center gap-2 mx-auto text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline transition-all">
                <ChevronLeft size={14} /> {language === 'uz' ? "Kirishga qaytish" : "Вернуться ко входу"}
             </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6">
            {(view === 'login' || view === 'signup' || view === 'forgot') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{t.email}</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-900/40 border border-white/5 rounded-2xl focus:border-indigo-600 focus:bg-slate-900 outline-none text-white transition-all font-bold text-lg"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'signup' || view === 'reset') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  {view === 'reset' ? (language === 'uz' ? "Yangi maxfiy parol" : "Новый пароль") : t.password}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                    className="w-full pl-14 pr-6 py-5 bg-slate-900/40 border border-white/5 rounded-2xl focus:border-indigo-600 focus:bg-slate-900 outline-none text-white transition-all font-bold text-lg"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {view === 'login' && (
              <div className="flex justify-end px-2">
                <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors flex items-center gap-2">
                  <KeyRound size={12} /> {language === 'uz' ? "Parolni unutdingizmi?" : "Забыли пароль?"}
                </button>
              </div>
            )}

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-4 active:scale-[0.96] disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                      {view === 'login' ? t.login : view === 'signup' ? t.signup : view === 'forgot' ? (language === 'uz' ? 'Havolani yuborish' : 'Отправить ссылку') : (language === 'uz' ? 'Yangi parolni saqlash' : 'Сохранить новый пароль')}
                      <ArrowRight size={20} />
                    </>
                  )}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col items-center gap-6">
          {!emailSent && view !== 'reset' && (
            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors">
              {view === 'login' ? t.noAccount : t.haveAccount}
            </button>
          )}

          <div className="flex gap-3">
             <button onClick={() => setLanguage('uz')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${language === 'uz' ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-900 text-slate-600 border-white/5'}`}>UZ</button>
             <button onClick={() => setLanguage('ru')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${language === 'ru' ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-900 text-slate-600 border-white/5'}`}>RU</button>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {view === 'reset' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl z-50 border border-white/20"
          >
            <ShieldCheck size={16} /> {language === 'uz' ? "Xavfsiz parolni yangilash seansi" : "Сессия безопасного обновления"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
