
export type Language = 'uz' | 'ru';
export type Theme = 'light' | 'dark';

export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  date: string; // ISO date string YYYY-MM-DD
  timeBlock?: string; // e.g., "09:00", "14:00"
  tags: string[];
  subtasks: SubTask[];
}

export interface Habit {
  id: string;
  title: string;
  streak: number; 
  completedDates: string[]; 
  color: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  subscription_expires_at: string | null;
  xp: number;
  level: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  title: string;
  date: string;
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  deadline?: string;
}

export interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  interestRate: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface AppState {
  language: Language;
  theme: Theme;
  tasks: Task[];
  habits: Habit[];
  notes: Note[];
  transactions: Transaction[];
  goals: SavingGoal[];
  debts: Debt[];
  userName: string;
  userProfile: UserProfile | null;
}

export interface AiAdvice {
  text: string;
  timestamp: number;
}
