
import React, { useState, useEffect } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Plus, Trash2, Calendar as CalendarIcon, Check, Circle, Sparkles, X, LayoutGrid, Clock, Tag, CheckCircle2, Edit3, ChevronRight } from 'lucide-react';
import { Priority, Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const TodoList = () => {
  const { language, tasks, addTask, updateTask, toggleTask, deleteTask, setIsModalActive } = useApp();
  const t = TRANSLATIONS[language];

  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Form States
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(getLocalDate());
  const [time, setTime] = useState('');

  useEffect(() => {
    setIsModalActive(!!modalType);
    return () => setIsModalActive(false);
  }, [modalType, setIsModalActive]);

  const openAdd = () => {
    setTitle('');
    setPriority('medium');
    setDate(getLocalDate());
    setTime('');
    setModalType('add');
  };

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setPriority(task.priority);
    setDate(task.date);
    setTime(task.timeBlock || '');
    setModalType('edit');
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (modalType === 'add') {
      await addTask({
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false,
        priority,
        date,
        timeBlock: time || undefined,
        tags: [],
        subtasks: []
      });
    } else if (modalType === 'edit' && selectedTask) {
      await updateTask({
        id: selectedTask.id,
        title,
        priority,
        date,
        timeBlock: time || undefined
      });
    }
    setModalType(null);
  };

  const priorityConfig = {
    high: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.timeBlock && b.timeBlock) return a.timeBlock.localeCompare(b.timeBlock);
    const pMap = { high: 0, medium: 1, low: 2 };
    return pMap[a.priority] - pMap[b.priority];
  });

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto pt-2">
      {/* 🚀 HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="space-y-1">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Vazifalar</h2>
            <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-indigo-500/10">
                   {tasks.length} JAMI
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                   {tasks.filter(t => !t.completed).length} KUTILMOQDA
                </span>
            </div>
        </div>

        <button 
          onClick={openAdd}
          className="w-full md:w-auto group relative overflow-hidden flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] active:scale-95 shadow-xl border-t border-white/20"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300">
               <Plus size={16} strokeWidth={4} />
            </div>
            {t.addTask}
          </div>
        </button>
      </div>

      <div className="space-y-3 px-1">
        <AnimatePresence mode="popLayout">
        {sortedTasks.map(task => {
          const config = priorityConfig[task.priority];
          return (
            <motion.div 
                layout key={task.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative overflow-hidden rounded-[2rem] transition-all duration-300 border ${task.completed ? 'bg-slate-900/30 border-white/5 opacity-60' : 'bg-[#0F1115] border-white/5 hover:border-white/10 shadow-lg'}`}
            >
                <div className="p-5 pl-6 flex items-center gap-4">
                    <div 
                        onClick={() => toggleTask(task.id)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 hover:border-indigo-500'}`}
                    >
                        {task.completed && <Check size={16} className="text-white" strokeWidth={4} />}
                    </div>

                    <div className="flex-1 min-w-0" onClick={() => openEdit(task)}>
                        <h3 className={`text-lg font-black tracking-tight truncate transition-all ${task.completed ? 'text-slate-600 line-through' : 'text-slate-100'}`}>
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                             {task.timeBlock && (
                                 <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                                     <Clock size={10} /> {task.timeBlock}
                                 </div>
                             )}
                             <span className="text-[9px] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-lg">
                                <CalendarIcon size={10} /> {task.date}
                             </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(task)} className="p-3 text-slate-500 hover:text-indigo-400 transition-all active:scale-90 bg-white/5 rounded-xl">
                            <Edit3 size={18} />
                        </button>
                        <button onClick={() => { if(window.confirm("O'chirishni tasdiqlaysizmi?")) deleteTask(task.id); }} className="p-3 text-slate-500 hover:text-rose-500 transition-all active:scale-90 bg-white/5 rounded-xl">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-30">
            <Sparkles size={64} className="text-slate-500 mb-4" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">{t.noTasks}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalType && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-end md:justify-center items-center sm:p-4"
            onClick={() => setModalType(null)}
          >
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0F1115] border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] relative shadow-[0_-20px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[95dvh]"
            >
                <div className="shrink-0 w-full flex items-center justify-center pt-4 pb-2 md:hidden" onClick={() => setModalType(null)}>
                    <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                </div>

                <div className="shrink-0 px-10 pb-4 pt-4 flex justify-between items-center">
                     <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter">{modalType === 'add' ? 'Yangi Vazifa' : 'Tahrirlash'}</h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Ma'lumotlarni kiriting</p>
                     </div>
                    <button onClick={() => setModalType(null)} className="p-3 text-slate-500 hover:text-white bg-white/5 rounded-full transition-colors"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 pt-4 pb-safe no-scrollbar">
                    <form onSubmit={handleAction} className="space-y-8 pb-20">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Vazifa nomi</label>
                            <textarea 
                                autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder={t.titlePlaceholder}
                                className="w-full text-xl font-black bg-slate-950 p-6 rounded-[1.5rem] border border-white/5 focus:border-indigo-500/50 outline-none text-white placeholder:text-slate-800 transition-all resize-none h-32"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Sana</label>
                                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-5 bg-slate-950 rounded-[1.5rem] font-black text-sm text-white outline-none border border-white/5 focus:border-indigo-500/50" />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Vaqt</label>
                                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-5 bg-slate-950 rounded-[1.5rem] font-black text-sm text-white outline-none border border-white/5 focus:border-indigo-500/50" />
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Muhimlik darajasi</label>
                              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-[1.5rem] border border-white/5">
                                  {(['low', 'medium', 'high'] as Priority[]).map(p => (
                                      <button 
                                          key={p} type="button" onClick={() => setPriority(p)}
                                          className={`py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${priority === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                      >
                                          {t[p]}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <button type="submit" className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl active:scale-95 transition-all">
                              {t.save}
                          </button>
                    </form>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
