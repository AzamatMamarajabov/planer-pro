
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
import { Sparkles } from 'lucide-react';
import { APP_CONFIG } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const MainApp = () => {
  const { session, isLoading } = useApp();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // URL va Hash orqali recovery rejimini aniqlash
    const checkRecovery = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', '?'));
      
      if (hash.includes('type=recovery') || hash.includes('access_token') || params.get('type') === 'recovery') {
        console.log("Recovery mode detected via URL");
        setIsRecoveryMode(true);
      }
    };

    checkRecovery();
    window.addEventListener('hashchange', checkRecovery);

    // Supabase Auth Eventlarini tinglash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event in App.tsx:", event);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
      if (event === 'USER_UPDATED') {
        // Parol yangilangach recovery rejimidan chiqish
        setTimeout(() => setIsRecoveryMode(false), 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', checkRecovery);
    };
  }, []);

  if (isLoading) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mb-4 animate-pulse">
                <Sparkles size={32} />
            </div>
            <p className="font-black text-xl tracking-tighter text-white">{APP_CONFIG.fullName}</p>
        </div>
    );
  }

  // DIQQAT: Agar recovery mode bo'lsa, Auth komponentini forcedView="reset" bilan chiqaramiz
  if (isRecoveryMode) {
    return <Auth forcedView="reset" />;
  }

  // Sessiya bo'lmasa oddiy Auth (Login/Signup)
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
