
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
import { motion } from 'framer-motion';

const MainApp = () => {
  const { session, isLoading } = useApp();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkInitialHash = () => {
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('type=recovery')) {
        setIsRecoveryMode(true);
        // Don't set isSyncing if session is already loading from AppContext
        if (!isLoading && !session) setIsSyncing(true);
      }
    };

    checkInitialHash();

    // Fix: Cast supabase.auth to any to bypass missing onAuthStateChange error on SupabaseAuthClient type
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, newSession: any) => {
      console.log("Auth Event Context:", event, !!newSession);
      
      const hash = window.location.hash;
      const isRecoveryFlow = hash.includes('type=recovery') || hash.includes('access_token');

      if (event === 'PASSWORD_RECOVERY' || isRecoveryFlow) {
        setIsRecoveryMode(true);
        setIsSyncing(false);
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (event === 'SIGNED_IN' && !isRecoveryFlow) {
           setIsRecoveryMode(false);
        }
        setIsSyncing(false);
      }

      if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
        setIsSyncing(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoading, session]);

  // Loading state (initial or during sync)
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

  // Recovery mode shows Reset Password view
  if (isRecoveryMode && !session) {
    // If we're in recovery mode but no session is detected yet, 
    // we might still be waiting for Supabase to process the hash.
    // However, forcedView="reset" handles the hash internally.
    return <Auth forcedView="reset" />;
  }
  
  if (isRecoveryMode && session) {
    // Session is present, user can now reset password
    return <Auth forcedView="reset" />;
  }

  // Not logged in
  if (!session) {
    return <Auth />;
  }

  // Standard App Layout
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
