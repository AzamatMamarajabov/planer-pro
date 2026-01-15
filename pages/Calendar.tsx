
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS, TIME_SLOTS } from '../constants';
import { 
  ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, 
  Clock, Trash2, CheckCircle2, CalendarCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Priority } from '../types';

export const CalendarPage = () => {
  const { language, tasks, addTask, updateTask, deleteTask, toggleTask, setIsModalActive } = useApp();
  const t = TRANSLATIONS[language];
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [activeTimeSlot, setActiveTimeSlot] = useState<string | null>(null);

  const [currentTimeOffset, setCurrentTimeOffset] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SLOT_HEIGHT = 90; 
  const START_HOUR = 6;   

  const formattedDate = getLocalDate(selectedDate);
  const isToday = formattedDate === getLocalDate();

  useEffect(() => {
    setIsModalActive(isModalOpen);
    return () => setIsModalActive(false);
  }, [isModalOpen, setIsModalActive]);

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  useEffect(() => {
    const updateTimeLine = () => {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        if (h >= START_HOUR && h <= 22) {
             const offset = ((h - START_HOUR) * SLOT_HEIGHT) + ((m / 60) * SLOT_HEIGHT);
             setCurrentTimeOffset(offset);
        } else setCurrentTimeOffset(-1);
    };
    updateTimeLine();
    const interval = setInterval(updateTimeLine, 60000);
    if (scrollRef.current && currentTimeOffset > 0) {
        scrollRef.current.scrollTop = currentTimeOffset - 100;
    }
    return () => clearInterval(interval);
  }, [currentTimeOffset]);

  const handleOpenAdd = (slot: string) => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskPriority('medium');
    setActiveTimeSlot(slot);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskPriority(task.priority);
    setActiveTimeSlot(task.timeBlock || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeTimeSlot) return;

    if (editingTask) {
      await updateTask({
        id: editingTask.id,
        title: taskTitle,
        priority: taskPriority,
        timeBlock: activeTimeSlot
      });
    } else {
      await addTask({
        id: Math.random().toString(36).substr(2, 9), 
        title: taskTitle,
        completed: false,
        date: formattedDate,
        priority: taskPriority,
        tags: [],
        subtasks: [],
        timeBlock: activeTimeSlot
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("O'chirilsinmi?")) {
      await deleteTask(id);
      setIsModalOpen(false);
    }
  };

  const tasksByTime = tasks.filter(task => task.date === formattedDate).reduce((acc, task) => {
    if (task.timeBlock) {
      if (!acc[task.timeBlock]) acc[task.timeBlock] = [];
      acc[task.timeBlock].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  const changeDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  return (
    <div className="flex flex-col h-full gap-4 max-w-6xl mx-auto">
      
      {/* Header Panel */}
      <div className="glass-panel p-4 rounded-[2rem] border border-white/5 space-y-4 shrink-0">
        <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <CalendarIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white capitalize tracking-tighter leading-none">
                        {selectedDate.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'long', year: 'numeric' })}
                    </h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">{formattedDate}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-white/5">
                <button onClick={() => changeDay(-1)} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 active:scale-90 transition-all"><ChevronLeft size={20}/></button>
                <button 
                  onClick={() => setSelectedDate(new Date())} 
                  className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                >
                  Bugun
                </button>
                <button onClick={() => changeDay(1)} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 active:scale-90 transition-all"><ChevronRight size={20}/></button>
            </div>
        </div>

        {/* Compact Week Strip */}
        <div className="grid grid-cols-7 gap-2 px-1">
            {weekDays.map((date, idx) => {
                const dateStr = getLocalDate(date);
                const isActive = dateStr === formattedDate;
                const isRealToday = dateStr === getLocalDate();
                const dayName = date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' }).slice(0, 3);
                
                return (
                    <button 
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 ${isActive ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-900/50 text-slate-500 border border-white/5'}`}
                    >
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-100' : isRealToday ? 'text-indigo-400' : 'text-slate-700'}`}>{dayName}</span>
                        <span className="text-lg font-black leading-none">{date.getDate()}</span>
                        {tasks.some(t => t.date === dateStr && !t.completed) && (
                           <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white shadow-[0_0_10px_white]' : 'bg-indigo-500'}`} />
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 relative min-h-0 bg-slate-950/20">
        <div className="flex-1 overflow-y-auto scroll-container relative no-scrollbar" ref={scrollRef}>
            <div className="relative min-h-full pb-32">
                {isToday && currentTimeOffset >= 0 && (
                    <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${currentTimeOffset}px` }}>
                        <div className="w-16 pr-3 text-right">
                            <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-1 rounded-full shadow-lg border border-white/10">
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <div className="flex-1 border-t-2 border-rose-500/50 relative">
                            <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)] border-2 border-white"></div>
                        </div>
                    </div>
                )}

                <div className="space-y-0"> 
                    {TIME_SLOTS.map((time) => (
                    <div key={time} className="flex relative" style={{ height: `${SLOT_HEIGHT}px` }}>
                        <div className="w-16 pr-4 text-right text-[10px] font-black text-slate-700 border-r border-white/5 pt-4 sticky left-0 bg-slate-950/80 backdrop-blur-md z-10 uppercase tracking-widest">
                             {time}
                        </div>
                        
                        <div 
                            className="flex-1 border-b border-white/5 relative pl-3 py-2 active:bg-white/[0.02] transition-colors"
                            onClick={(e) => { if (e.target === e.currentTarget) handleOpenAdd(time); }}
                        >
                            <div className="flex flex-col gap-2 pr-3 pt-1 h-full pointer-events-none">
                                {tasksByTime[time]?.map(task => (
                                    <div 
                                        key={task.id} 
                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(task); }}
                                        className={`pointer-events-auto px-4 py-3 rounded-2xl border-l-4 text-[11px] font-black shadow-2xl flex items-center justify-between active:scale-[0.98] transition-all group
                                            ${task.completed ? 'bg-slate-900/50 border-slate-700 text-slate-600 opacity-60' : 
                                            task.priority === 'high' ? 'bg-rose-500/10 border-rose-500 text-rose-200' :
                                            task.priority === 'medium' ? 'bg-amber-500/10 border-amber-500 text-amber-200' :
                                            'bg-indigo-500/10 border-indigo-500 text-indigo-200'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 truncate w-full">
                                           <div onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} className="shrink-0">
                                              {task.completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-30" />}
                                           </div>
                                           <span className="truncate tracking-tight">{task.title}</span>
                                        </div>
                                        <Zap size={12} className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${task.priority === 'high' ? 'text-rose-500' : 'text-indigo-500'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* 🚀 KEYBOARD SAFE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-end md:justify-center items-center sm:p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
               initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
               onClick={(e) => e.stopPropagation()}
               className="w-full max-w-lg bg-[#0F1115] border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] relative shadow-2xl flex flex-col max-h-[95dvh]"
            >
              <div className="shrink-0 w-full flex items-center justify-center pt-4 pb-2 md:hidden" onClick={() => setIsModalOpen(false)}>
                    <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              <div className="shrink-0 px-10 pb-4 pt-4 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">{editingTask ? 'Vazifani tahrirlash' : 'Yangi reja'}</h3>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Reja tafsilotlari</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-500 hover:text-white bg-white/5 rounded-full"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 pt-4 pb-safe no-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Vazifa nomi</label>
                        <textarea 
                            autoFocus value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder={t.titlePlaceholder}
                            className="w-full p-6 bg-slate-950 border border-white/5 rounded-[1.5rem] outline-none text-white text-lg font-black focus:border-indigo-500/50 transition-all resize-none h-32"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Vaqt bloki</label>
                             <select value={activeTimeSlot || ''} onChange={(e) => setActiveTimeSlot(e.target.value)} className="w-full p-5 bg-slate-950 text-white rounded-[1.5rem] border border-white/5 font-black appearance-none focus:border-indigo-500/50">
                                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Muhimlik</label>
                            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950 rounded-[1.5rem] border border-white/5">
                                {(['low', 'medium', 'high'] as Priority[]).map(p => (
                                    <button key={p} type="button" onClick={() => setTaskPriority(p)} className={`py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${taskPriority === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'}`}>{t[p].slice(0, 3)}</button>
                                ))}
                            </div>
                        </div>
                     </div>

                     <div className="flex gap-3 pt-2">
                        {editingTask && (
                            <button type="button" onClick={() => handleDelete(editingTask.id)} className="p-6 bg-rose-500/10 text-rose-500 rounded-[1.5rem] hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={24} /></button>
                        )}
                        <button type="submit" disabled={!taskTitle.trim()} className="flex-1 py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">
                            {t.save}
                        </button>
                     </div>
                  </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
