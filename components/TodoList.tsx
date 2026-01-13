
import React, { useState } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Plus, Trash2, Calendar as CalendarIcon, CheckCircle2, Circle, Sparkles, X, LayoutGrid } from 'lucide-react';
import { Priority } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const TodoList = () => {
  const { language, tasks, addTask, toggleTask, deleteTask } = useApp();
  const t = TRANSLATIONS[language];

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDate, setNewDate] = useState(getLocalDate());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      completed: false,
      priority: newPriority,
      date: newDate,
      tags: [],
      subtasks: []
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const priorityConfig = {
    high: { color: 'text-rose-400', glow: 'shadow-rose-500/20', bg: 'bg-rose-500/10' },
    medium: { color: 'text-amber-400', glow: 'shadow-amber-500/20', bg: 'bg-amber-500/10' },
    low: { color: 'text-emerald-400', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pMap = { high: 0, medium: 1, low: 2 };
    return pMap[a.priority] - pMap[b.priority];
  });

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 pt-4 px-2">
        <div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">Vazifalar <span className="ai-gradient-text">Markazi</span></h2>
            <p className="text-slate-400 font-medium flex items-center gap-2 text-sm">
                <LayoutGrid size={16} /> {tasks.length} ta faol reja • {tasks.filter(t => t.completed).length} ta bajarildi
            </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all hover:bg-indigo-500 active:scale-95 shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <Plus size={24} /> {t.addTask}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-end md:items-center justify-center sm:p-4"
            onClick={() => setIsAdding(false)}
          >
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl bg-slate-900 border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 pb-10 md:p-10 relative shadow-2xl max-h-[85vh] overflow-y-auto"
            >
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-8 md:hidden opacity-50" />
                <button type="button" onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white p-3 bg-white/5 rounded-full active:scale-90"><X size={20}/></button>
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-white"><Sparkles className="text-indigo-400" /> Yangi Vazifa</h3>
                <form onSubmit={handleAdd} className="space-y-6">
                    <input 
                        type="text" value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder={t.titlePlaceholder}
                        className="w-full text-xl md:text-2xl font-bold bg-transparent border-b border-white/10 pb-4 focus:border-indigo-500 outline-none text-white placeholder:text-slate-700 transition-colors"
                        autoFocus
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Muhimlik</label>
                            <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as Priority[]).map(p => (
                                    <button 
                                        key={p} type="button" onClick={() => setNewPriority(p)}
                                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 ${newPriority === p ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</label>
                            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full p-3 bg-white/5 rounded-xl font-bold text-sm text-white outline-none border border-white/5 focus:border-indigo-500 appearance-none" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                        <CheckCircle2 size={24} /> Saqlash
                    </button>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 px-2 md:px-4">
        <AnimatePresence mode="popLayout">
        {sortedTasks.map(task => {
          const config = priorityConfig[task.priority];
          return (
            <motion.div 
                layout key={task.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`neo-card flex items-center gap-4 p-5 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden group ${task.completed ? 'opacity-40 grayscale' : ''}`}
                onClick={() => toggleTask(task.id)}
            >
                <div className={`shrink-0 p-2 -m-2 transition-transform active:scale-75 ${task.completed ? 'text-emerald-400' : 'text-slate-600 hover:text-indigo-400'}`}>
                    {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} strokeWidth={1.5} />}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`text-base md:text-xl font-bold tracking-tight mb-1 truncate leading-tight ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${config.bg} ${config.color} border border-white/5`}>
                           <Sparkles size={10}/> {task.priority}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <CalendarIcon size={10}/> {task.date}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if(window.confirm(language === 'uz' ? "Ushbu vazifani o'chirib tashlamoqchimisiz?" : "Удалить эту задачу?")) {
                          deleteTask(task.id); 
                        }
                    }} 
                    className="p-3 text-slate-700 hover:text-rose-500 bg-white/5 rounded-xl transition-all active:scale-90 relative z-10"
                >
                    <Trash2 size={20} />
                </button>
            </motion.div>
          );
        })}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="text-center py-20 neo-card rounded-[2.5rem] border-dashed mx-2">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 active-glow">
               <Sparkles size={32} className="text-indigo-400" />
            </div>
            <p className="text-lg font-black text-slate-500 tracking-tight">{t.noTasks}</p>
          </div>
        )}
      </div>
    </div>
  );
};
