
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, APP_CONFIG } from '../constants';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, CheckCircle2, KeyRound, AlertCircle, Send, ChevronLeft, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'reset'>(forcedView || 'login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (forcedView) {
      setView(forcedView);
      if (forcedView === 'reset') setEmailSent(false);
    }
  }, [forcedView]);

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
        const redirectUrl = `${window.location.origin}/#type=recovery`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) throw error;
        setEmailSent(true);
        setSuccess(language === 'uz' ? "Havola yuborildi!" : "Ссылка отправлена!");
      } else if (view === 'reset') {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          const hash = window.location.hash;
          if (hash.includes('access_token')) {
             await new Promise(r => setTimeout(r, 1000));
             const { data: retrySession } = await supabase.auth.getSession();
             if (!retrySession.session) throw new Error(language === 'uz' ? "Xavfsizlik sessiyasi topilmadi. Iltimos, linkdan qaytadan foydalaning." : "Сессия не найдена. Пожалуйста, используйте ссылку снова.");
          } else {
             throw new Error(language === 'uz' ? "Sessiya muddati tugagan. Qaytadan login qiling." : "Сессия истекла. Пожалуйста, войдите снова.");
          }
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setSuccess(language === 'uz' ? "Parol muvaffaqiyatli o'zgartirildi!" : "Пароль успешно изменен!");
        setTimeout(() => {
           window.location.hash = '';
           window.location.href = '/';
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  const getSubtitle = () => {
    if (view === 'forgot') return language === 'uz' ? "Emailingizni kiriting" : "Введите ваш email";
    if (view === 'reset') return language === 'uz' ? "Yangi maxfiy so'z o'ylab toping" : "Придумайте новый пароль";
    if (view === 'signup') return language === 'uz' ? "Yangi hisob yarating" : "Создайте новый аккаунт";
    return language === 'uz' ? "Hisobingizga kiring" : "Войдите в аккаунт";
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[360px] md:max-w-[400px] flex flex-col z-10"
      >
        <div className="text-center space-y-3 mb-6 md:mb-8">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl border border-white/10"
          >
              <Sparkles size={32} className="text-white fill-white/20 md:w-10 md:h-10" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
              {APP_CONFIG.name}<span className="text-indigo-500">{APP_CONFIG.suffix}</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs md:text-sm mt-1">{getSubtitle()}</p>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] border border-white/10 p-5 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <div className="p-3 md:p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] md:text-xs font-bold rounded-xl md:rounded-2xl flex items-start gap-3">
                  <AlertCircle size={14} className="shrink-0 mt-0.5 md:w-4 md:h-4" /> <span>{error}</span>
                </div>
              </motion.div>
            )}
            {success && !emailSent && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <div className="p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] md:text-xs font-bold rounded-xl md:rounded-2xl flex items-start gap-3">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5 md:w-4 md:h-4" /> <span>{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {emailSent && view === 'forgot' ? (
            <div className="text-center space-y-5 py-2 md:py-4">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-indigo-500/30">
                  <Send size={24} className="text-indigo-400 md:w-8 md:h-8" />
               </div>
               <div>
                  <h3 className="text-white font-bold text-base md:text-lg mb-1 md:mb-2">{language === 'uz' ? "Email yuborildi!" : "Письмо отправлено!"}</h3>
                  <p className="text-slate-400 text-[11px] md:text-xs leading-relaxed px-2">
                      {language === 'uz' ? `Havola ${email} manziliga yuborildi.` : `Ссылка отправлена на ${email}.`}
                  </p>
               </div>
               <button onClick={() => { setEmailSent(false); setView('login'); }} className="w-full py-3 md:py-4 bg-slate-800 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                  <ChevronLeft size={14} /> {language === 'uz' ? "Ortga" : "Назад"}
               </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4 md:space-y-5">
              {(view === 'login' || view === 'signup' || view === 'forgot') && (
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.email}</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                        <Mail size={18} className="md:w-5 md:h-5" />
                    </div>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-slate-900 outline-none text-white transition-all font-bold text-sm md:text-base placeholder:text-slate-700" 
                        placeholder="name@example.com" 
                    />
                  </div>
                </div>
              )}

              {(view === 'login' || view === 'signup' || view === 'reset') && (
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{view === 'reset' ? (language === 'uz' ? "Yangi parol" : "Новый пароль") : t.password}</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                        <Lock size={18} className="md:w-5 md:h-5" />
                    </div>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        minLength={6} 
                        className="w-full pl-10 md:pl-12 pr-11 md:pr-12 py-3 md:py-4 bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-slate-900 outline-none text-white transition-all font-bold text-sm md:text-base placeholder:text-slate-700" 
                        placeholder="••••••••" 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors p-1"
                    >
                        {showPassword ? <EyeOff size={16} className="md:w-4.5 md:h-4.5" /> : <Eye size={16} className="md:w-4.5 md:h-4.5" />}
                    </button>
                  </div>
                </div>
              )}

              {view === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setView('forgot')} className="text-[10px] md:text-[11px] font-bold text-slate-500 hover:text-indigo-400 transition-colors">
                    {language === 'uz' ? "Parolni unutdingizmi?" : "Забыли пароль?"}
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3.5 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/20 rounded-xl md:rounded-2xl font-black text-[12px] md:text-sm uppercase tracking-widest transition-all flex justify-center items-center gap-2.5 md:gap-3 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 mt-1 md:mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                        {view === 'login' ? t.login : view === 'signup' ? t.signup : view === 'forgot' ? (language === 'uz' ? 'Yuborish' : 'Отправить') : (language === 'uz' ? 'Saqlash' : 'Сохранить')} 
                        <ArrowRight size={16} className="md:w-4.5 md:h-4.5" />
                    </>
                )}
              </button>
            </form>
          )}

          {!emailSent && view !== 'reset' && (
             <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/5 text-center">
                <p className="text-slate-500 text-[11px] md:text-xs font-medium mb-2 md:mb-3">
                    {view === 'login' 
                        ? (language === 'uz' ? "Hali hisobingiz yo'qmi?" : "Нет аккаунта?") 
                        : (language === 'uz' ? "Hisobingiz bormi?" : "Уже есть аккаунт?")}
                </p>
                <button 
                    onClick={() => setView(view === 'login' ? 'signup' : 'login')} 
                    className="text-indigo-400 font-black text-[11px] md:text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors p-1"
                >
                    {view === 'login' ? t.signup : t.login}
                </button>
             </div>
          )}
          
          {view === 'forgot' && !emailSent && (
             <button onClick={() => setView('login')} className="w-full mt-3 md:mt-4 text-slate-500 text-[11px] md:text-xs font-bold hover:text-white transition-colors py-1">
                 {language === 'uz' ? "Kirishga qaytish" : "Вернуться ко входу"}
             </button>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6 md:mt-8">
            <button onClick={() => setLanguage('uz')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${language === 'uz' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}>O'zbekcha</button>
            <div className="w-px h-5 md:h-6 bg-white/10 self-center"></div>
            <button onClick={() => setLanguage('ru')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${language === 'ru' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}>Русский</button>
        </div>
      </motion.div>
    </div>
  );
};
