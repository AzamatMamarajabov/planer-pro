
import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './pages/Dashboard';
import { CalendarPage } from './pages/Calendar';
import { TasksPage } from './pages/Tasks';
import { HabitsPage } from './pages/Habits';
import { AICoachPage } from './pages/AICoach';
import { AIPlannerPage } from './pages/AIPlanner';
import { AdminPage } from './pages/Admin';
import { ProfilePage } from './pages/Profile';
import { FinancePage } from './pages/Finance';
import { Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
// Added missing motion import
import { motion } from 'framer-motion';

const MainApp = () => {
  const { session, isLoading } = useApp();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const handleAuthChange = async (event: string, newSession: any) => {
      console.log("Auth Event Context:", event, !!newSession);
      
      const hash = window.location.hash;
      const isRecoveryFlow = hash.includes('type=recovery') || hash.includes('access_token');

      if (isRecoveryFlow || event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        
        // Agar sessiya hali yo'q bo'lsa, uni kutish rejimiga o'tamiz
        if (!newSession) {
          setIsSyncing(true);
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setIsSyncing(false);
          }
        } else {
          setIsSyncing(false);
        }
      }

      if (event === 'USER_UPDATED') {
        // Parol yangilangach sessiyani tozalash va Dashboardga o'tish
        setTimeout(() => {
          setIsRecoveryMode(false);
          setIsSyncing(false);
        }, 1500);
      }
    };

    // Dastlabki tekshiruv
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('type=recovery')) {
      setIsSyncing(true);
      setIsRecoveryMode(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthChange(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Kutish ekrani (Sinxronizatsiya paytida)
  if (isLoading || isSyncing) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center shadow-2xl mb-6 border border-indigo-500/20">
                  <Loader2 size={40} className="text-indigo-500 animate-spin" />
              </div>
              <p className="font-black text-xl tracking-tighter text-white uppercase">Xavfsiz ulanish...</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 animate-pulse">
                Sessiya sinxronizatsiya qilinmoqda
              </p>
            </motion.div>
        </div>
    );
  }

  // Recovery rejimida Auth komponentini ko'rsatamiz
  if (isRecoveryMode) {
    return <Auth forcedView="reset" />;
  }

  // Sessiya yo'q bo'lsa Login/Signup
  if (!session) {
    return <Auth />;
  }

  return (
    <MemoryRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/coach" element={<AICoachPage />} />
          <Route path="/ai-planner" element={<AIPlannerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </MemoryRouter>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
