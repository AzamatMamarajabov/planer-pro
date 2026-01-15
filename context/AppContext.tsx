
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AppState, Language, Theme, Task, Habit, UserProfile, Note, Transaction, SavingGoal, Debt } from '../types';
import { Session } from '@supabase/supabase-js';

interface AppContextType extends AppState {
  session: Session | null;
  isLoading: boolean;
  isModalActive: boolean;
  setIsModalActive: (val: boolean) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  addTask: (task: Task) => Promise<void>;
  addTasksBulk: (newTasks: Partial<Task>[]) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (task: Partial<Task> & { id: string }) => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  toggleHabitForDate: (id: string, date: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addNote: (content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  convertNoteToTask: (noteId: string, content: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<SavingGoal, 'id'>) => Promise<void>;
  updateGoal: (goal: Partial<SavingGoal> & { id: string }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  updateDebt: (debt: Partial<Debt> & { id: string }) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  awardXP: (amount: number) => Promise<void>;
  xpNotification: { amount: number; id: number } | null;
  logFocusSession: (minutes: number) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  isAdmin: boolean;
  hasAccess: boolean;
  grantAccess: (userId: string) => Promise<void>;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUserProfile: (id: string) => Promise<void>;
  getAllProfiles: () => Promise<UserProfile[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const getLocalDate = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [language, setLanguage] = useState<Language>('uz');
  const [theme, setTheme] = useState<Theme>('dark');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [xpNotification, setXpNotification] = useState<{ amount: number; id: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('plannerProState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.theme) setTheme(parsed.theme);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('plannerProState', JSON.stringify({ language, theme }));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (isDemo) return;
    const initSession = async () => {
        if (!isSupabaseConfigured) { setIsLoading(false); return; }
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setIsLoading(false);
    };
    initSession();
    if (isSupabaseConfigured) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
        });
        return () => subscription.unsubscribe();
    }
  }, [isDemo]);

  useEffect(() => {
    if (session) {
      if (isDemo) loadDemoData();
      else {
          fetchUserProfile(session.user.id, session.user.email);
          fetchTasks();
          fetchHabits();
          fetchNotes();
          fetchTransactions();
          fetchGoals();
          fetchDebts();
      }
    }
  }, [session, isDemo]);

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle(); 
      if (data) {
        setUserProfile(data as UserProfile);
      } else {
        const newProfile: UserProfile = { 
          id: userId, email: email || 'unknown', role: 'user', is_active: true, 
          subscription_expires_at: null, xp: 0, level: 1 
        };
        const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
        if (!insertError) setUserProfile(newProfile);
      }
    } catch (err) { console.error("Profile fetch error:", err); }
  };

  const fetchTasks = async () => { 
    if(!session || isDemo) return; 
    const { data } = await supabase.from('todos').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }); 
    if(data) {
      setTasks(data.map(t => ({ 
        id: t.id.toString(), title: t.title, completed: t.is_completed, 
        priority: t.priority, date: t.date, time_block: t.time_block,
        tags: t.tags || [], subtasks: [] 
      })));
    }
  };

  const fetchHabits = async () => { 
    if(!session || isDemo) return; 
    const { data } = await supabase.from('habits').select('*').eq('user_id', session.user.id); 
    if(data) {
      setHabits(data.map(h => ({ 
        id: h.id.toString(), title: h.title, streak: h.streak || 0, 
        completedDates: h.completed_dates || [], color: h.color || 'bg-indigo-500' 
      })));
    }
  };

  const fetchNotes = async () => { 
    if(!session || isDemo) return; 
    const { data } = await supabase.from('notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }); 
    if(data) setNotes(data.map(n => ({...n, id: n.id.toString()}))); 
  };

  const fetchTransactions = async () => {
    if (!session || isDemo) return;
    const { data } = await supabase.from('transactions').select('*').eq('user_id', session.user.id).order('date', { ascending: false });
    if (data) setTransactions(data.map(t => ({ ...t, id: t.id.toString() })));
  };

  const fetchGoals = async () => {
    if (!session || isDemo) return;
    const { data } = await supabase.from('goals').select('*').eq('user_id', session.user.id);
    if (data) setGoals(data.map(g => ({ id: g.id.toString(), title: g.title, targetAmount: g.target_amount, currentAmount: g.current_amount, color: g.color, deadline: g.deadline })));
  };

  const fetchDebts = async () => {
    if (!session || isDemo) return;
    const { data } = await supabase.from('debts').select('*').eq('user_id', session.user.id);
    if (data) setDebts(data.map(d => ({ id: d.id.toString(), title: d.title, totalAmount: d.total_amount, paidAmount: d.paid_amount, interestRate: d.interest_rate })));
  };

  const awardXP = async (amount: number) => { 
    if(!userProfile) return; 
    const newXP = (userProfile.xp || 0) + amount; 
    const newLevel = Math.floor(newXP / 100) + 1; 
    setUserProfile({ ...userProfile, xp: newXP, level: newLevel }); 
    setXpNotification({ amount, id: Date.now() });
    if(!isDemo) await supabase.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', userProfile.id); 
  };

  const logFocusSession = async (minutes: number) => {
    await awardXP(Math.floor(minutes / 2.5) * 1); 
  };

  const addTask = async (task: Task) => { 
    if(!session?.user) return; 
    const { data } = await supabase.from('todos').insert([{ 
      user_id: session.user.id, title: task.title, priority: task.priority, 
      date: task.date, time_block: task.timeBlock, is_completed: false 
    }]).select();
    if (data) {
      setTasks(prev => [{ ...task, id: data[0].id.toString() }, ...prev]); 
      awardXP(5);
    }
  };

  const addTasksBulk = async (newTasks: Partial<Task>[]) => {
    if(!session?.user || newTasks.length === 0) return;
    const insertData = newTasks.map(t => ({
      user_id: session.user.id, title: String(t.title || "Vazifa"),
      priority: t.priority || 'medium', date: t.date || getLocalDate(),
      time_block: t.timeBlock || null, is_completed: false
    }));
    const { data } = await supabase.from('todos').insert(insertData).select();
    if (data) {
      const added = data.map(d => ({ id: d.id.toString(), title: d.title, completed: d.is_completed, priority: d.priority as any, date: d.date, timeBlock: d.time_block, tags: [], subtasks: [] }));
      setTasks(prev => [...added, ...prev]);
      awardXP(added.length * 5);
    }
  };

  const toggleTask = async (id: string) => { 
    const task = tasks.find(t => t.id === id); 
    if(!task) return; 
    const newStatus = !task.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newStatus } : t)); 
    if(!isDemo) await supabase.from('todos').update({ is_completed: newStatus }).eq('id', id); 
    if(newStatus) awardXP(10); 
  };

  const deleteTask = async (id: string) => { 
    setTasks(prev => prev.filter(t => t.id !== id)); 
    if(!isDemo) {
        try {
            const { error } = await supabase.from('todos').delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error("Task o'chirishda xatolik:", err);
            fetchTasks(); 
        }
    }
  };

  const updateTask = async (fields: any) => { 
    setTasks(prev => prev.map(t => t.id === fields.id ? { ...t, ...fields } : t)); 
    if(!isDemo) {
        const dbFields: any = { ...fields };
        if (dbFields.timeBlock) { dbFields.time_block = dbFields.timeBlock; delete dbFields.timeBlock; }
        if (dbFields.completed !== undefined) { dbFields.is_completed = dbFields.completed; delete dbFields.completed; }
        const { id, ...rest } = dbFields;
        await supabase.from('todos').update(rest).eq('id', id); 
    }
  };

  const addHabit = async (h: Habit) => { 
    if(!session?.user) return;
    const { data } = await supabase.from('habits').insert([{ 
      user_id: session.user.id, title: h.title, color: h.color, completed_dates: [] 
    }]).select();
    if(data) setHabits(prev => [{ ...h, id: data[0].id.toString() }, ...prev]); 
  };

  const toggleHabitForDate = async (id: string, date: string) => { 
    const h = habits.find(x => x.id === id); 
    if(!h) return; 
    const exists = h.completedDates.includes(date); 
    const newDates = exists ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date]; 
    setHabits(prev => prev.map(x => x.id === id ? { ...x, completedDates: newDates } : x)); 
    if(!isDemo) await supabase.from('habits').update({ completed_dates: newDates }).eq('id', id);
    if(!exists) awardXP(5); 
  };

  const deleteHabit = async (id: string) => { 
    setHabits(prev => prev.filter(h => h.id !== id)); 
    if(!isDemo) {
        try {
            const { error } = await supabase.from('habits').delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error("Odatni o'chirishda xatolik:", err);
            fetchHabits();
        }
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!session?.user) return;
    const { data } = await supabase.from('transactions').insert([{ user_id: session.user.id, ...transaction }]).select();
    if (data) setTransactions(prev => [{ ...transaction, id: data[0].id.toString() }, ...prev]);
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (!isDemo) await supabase.from('transactions').delete().eq('id', id);
  };

  const addGoal = async (goal: Omit<SavingGoal, 'id'>) => {
    if (!session?.user) return;
    const { data } = await supabase.from('goals').insert([{ user_id: session.user.id, title: goal.title, target_amount: goal.targetAmount, current_amount: goal.currentAmount, color: goal.color, deadline: goal.deadline }]).select();
    if (data) setGoals(prev => [...prev, { ...goal, id: data[0].id.toString() }]);
  };

  const updateGoal = async (goal: Partial<SavingGoal> & { id: string }) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ...goal } : g));
    if (!isDemo) {
        const up: any = {};
        if (goal.currentAmount !== undefined) up.current_amount = goal.currentAmount;
        if (goal.title) up.title = goal.title;
        await supabase.from('goals').update(up).eq('id', goal.id);
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (!isDemo) await supabase.from('goals').delete().eq('id', id);
  };

  const addDebt = async (debt: Omit<Debt, 'id'>) => {
    if (!session?.user) return;
    const { data } = await supabase.from('debts').insert([{ user_id: session.user.id, title: debt.title, total_amount: debt.totalAmount, paid_amount: debt.paidAmount, interest_rate: debt.interestRate }]).select();
    if (data) setDebts(prev => [...prev, { ...debt, id: data[0].id.toString() }]);
  };

  const updateDebt = async (debt: Partial<Debt> & { id: string }) => {
    setDebts(prev => prev.map(d => d.id === debt.id ? { ...d, ...debt } : d));
    if (!isDemo) {
        const up: any = {};
        if (debt.paidAmount !== undefined) up.paid_amount = debt.paidAmount;
        await supabase.from('debts').update(up).eq('id', debt.id);
    }
  };

  const deleteDebt = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    if (!isDemo) await supabase.from('debts').delete().eq('id', id);
  };

  const addNote = async (content: string) => { 
    if(!session?.user) return;
    const { data } = await supabase.from('notes').insert([{ user_id: session.user.id, content }]).select(); 
    if(data) setNotes(prev => [{...data[0], id: data[0].id.toString()}, ...prev]); 
  };

  const deleteNote = async (id: string) => { 
    setNotes(prev => prev.filter(n => n.id !== id)); 
    if(!isDemo) await supabase.from('notes').delete().eq('id', id); 
  };

  const convertNoteToTask = async (id: string, content: string) => { 
    await addTask({ id: Date.now().toString(), title: content, completed: false, priority: 'medium', date: getLocalDate(), tags: [], subtasks: [] }); 
    await deleteNote(id); 
  };

  const signOut = async () => { 
    if(isDemo) { setIsDemo(false); setSession(null); } 
    else await supabase.auth.signOut(); 
  };

  const enterDemoMode = () => { setIsDemo(true); setSession({ user: { id: 'demo', email: 'demo@planner.ai' } } as any); };
  const loadDemoData = () => { setUserProfile({ id: 'demo', email: 'demo@planner.ai', role: 'admin', is_active: true, subscription_expires_at: null, xp: 120, level: 2 }); };

  const isAdmin = userProfile?.role === 'admin';
  const hasAccess = !!(userProfile && userProfile.is_active);

  const getAllProfiles = async () => isAdmin && !isDemo ? (await supabase.from('profiles').select('*')).data || [] : [];
  const updateUserProfile = async (id: string, updates: any) => { if(isAdmin) await supabase.from('profiles').update(updates).eq('id', id); };
  const deleteUserProfile = async (id: string) => { if(isAdmin) await supabase.from('profiles').delete().eq('id', id); };
  const grantAccess = async (userId: string) => { await updateUserProfile(userId, { is_active: true }); };

  return (
    <AppContext.Provider value={{
      language, theme, tasks, habits, notes, transactions, goals, debts, userName: session?.user?.email?.split('@')[0] || 'User', userProfile, session, isLoading,
      isModalActive, setIsModalActive,
      setLanguage, setTheme, toggleTheme, addTask, addTasksBulk, toggleTask, deleteTask, updateTask,
      addHabit, toggleHabitForDate, deleteHabit, addNote, deleteNote, convertNoteToTask,
      addTransaction, deleteTransaction, addGoal, updateGoal, deleteGoal, addDebt, updateDebt, deleteDebt,
      awardXP, xpNotification, logFocusSession, signOut, enterDemoMode,
      isAdmin, hasAccess, grantAccess, updateUserProfile, deleteUserProfile, getAllProfiles
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
