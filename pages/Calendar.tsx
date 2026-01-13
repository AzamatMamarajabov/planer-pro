
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS, TIME_SLOTS } from '../constants';
import { 
  ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, 
  Clock, Trash2, CheckCircle2, CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Priority } from '../types';

export const CalendarPage = () => {
  const { language, tasks, addTask, updateTask, deleteTask, toggleTask } = useApp();
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
  }, []);

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
      <div className="glass-panel p-4 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 space-y-4 shrink-0">
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <CalendarIcon size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-white capitalize tracking-tight leading-none">
                        {selectedDate.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'long', year: 'numeric' })}
                    </h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">{formattedDate}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-800/40 p-1.5 rounded-xl border border-white/5">
                <button onClick={() => changeDay(-1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={20}/></button>
                <button 
                  onClick={() => setSelectedDate(new Date())} 
                  className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider active:scale-95 transition-transform"
                >
                  Bugun
                </button>
                <button onClick={() => changeDay(1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 active:scale-90 transition-transform"><ChevronRight size={20}/></button>
            </div>
        </div>

        {/* Compact Week Strip */}
        <div className="grid grid-cols-7 gap-1">
            {weekDays.map((date, idx) => {
                const dateStr = getLocalDate(date);
                const isActive = dateStr === formattedDate;
                const isRealToday = dateStr === getLocalDate();
                const dayName = date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' }).slice(0, 2);
                
                return (
                    <button 
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/30 text-slate-500 border border-white/5'}`}
                    >
                        <span className={`text-[9px] font-black uppercase ${isActive ? 'text-indigo-100' : isRealToday ? 'text-indigo-400' : 'text-slate-600'}`}>{dayName}</span>
                        <span className="text-base font-black">{date.getDate()}</span>
                        {tasks.some(t => t.date === dateStr && !t.completed) && (
                           <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-white' : 'bg-indigo-500'}`} />
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Time Grid - Independent Scroll */}
      <div className="flex-1 glass-panel rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex flex-col border border-white/5 relative min-h-0">
        <div className="flex-1 overflow-y-auto scroll-container relative" ref={scrollRef}>
            <div className="relative min-h-full pb-32">
                {/* Current Time Line */}
                {isToday && currentTimeOffset >= 0 && (
                    <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${currentTimeOffset}px` }}>
                        <div className="w-14 pr-2 text-right">
                            <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full shadow-lg">
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <div className="flex-1 border-t border-rose-500/50 relative">
                            <div className="absolute -left-1 -top-1 w-2 h-2 bg-rose-500 rounded-full"></div>
                        </div>
                    </div>
                )}

                <div className="space-y-0"> 
                    {TIME_SLOTS.map((time) => (
                    <div key={time} className="flex relative" style={{ height: `${SLOT_HEIGHT}px` }}>
                        <div className="w-14 pr-3 text-right text-[10px] font-black text-slate-600 border-r border-white/5 pt-3 sticky left-0 bg-slate-950/95 backdrop-blur-sm z-10">
                             {time}
                        </div>
                        
                        <div 
                            className="flex-1 border-b border-white/5 relative pl-2 py-1 active:bg-white/[0.03] transition-colors"
                            onClick={(e) => { if (e.target === e.currentTarget) handleOpenAdd(time); }}
                        >
                            <div className="flex flex-col gap-1 pr-2 pt-1 h-full pointer-events-none">
                                {tasksByTime[time]?.map(task => (
                                    <div 
                                        key={task.id} 
                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(task); }}
                                        className={`pointer-events-auto px-3 py-2 rounded-xl border-l-4 text-[11px] font-bold shadow-lg flex items-center justify-between active:scale-[0.98] transition-transform
                                            ${task.completed ? 'bg-slate-800/50 border-slate-600 text-slate-500 opacity-60' : 
                                            task.priority === 'high' ? 'bg-rose-500/10 border-rose-500 text-rose-200' :
                                            task.priority === 'medium' ? 'bg-amber-500/10 border-amber-500 text-amber-200' :
                                            'bg-indigo-500/10 border-indigo-500 text-indigo-200'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2 truncate w-full">
                                           <div onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} className="shrink-0">
                                              {task.completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-current opacity-40" />}
                                           </div>
                                           <span className="truncate">{task.title}</span>
                                        </div>
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

      {/* Mobile FAB */}
      <div className="fixed bottom-24 right-4 md:hidden z-40">
          <button 
             onClick={() => handleOpenAdd(TIME_SLOTS[0])}
             className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.5)] flex items-center justify-center active:scale-90 transition-transform active-glow border-4 border-slate-900"
          >
              <Plus size={28} />
          </button>
      </div>

      {/* Task Modal (Mobile Optimized) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-end justify-center sm:items-center sm:p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
               initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
               onClick={(e) => e.stopPropagation()}
               className="w-full max-w-md bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 pb-12 md:pb-6 relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 md:hidden opacity-50" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">{editingTask ? 'Tahrirlash' : 'Yangi vazifa'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 p-2 bg-white/5 rounded-full"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <input 
                    autoFocus type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={t.titlePlaceholder}
                    className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl outline-none text-white text-lg font-bold"
                 />

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase">Vaqt</label>
                         <select value={activeTimeSlot || ''} onChange={(e) => setActiveTimeSlot(e.target.value)} className="w-full p-4 bg-slate-950 text-white rounded-2xl border border-white/10 font-bold appearance-none">
                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Muhimlik</label>
                        <div className="flex gap-1 h-full">
                            {(['low', 'medium', 'high'] as Priority[]).map(p => (
                                <button key={p} type="button" onClick={() => setTaskPriority(p)} className={`flex-1 rounded-xl font-black text-[9px] uppercase border transition-all ${taskPriority === p ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-950 border-white/10 text-slate-500'}`}>{t[p].slice(0, 3)}</button>
                            ))}
                        </div>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-2">
                    {editingTask && (
                        <button type="button" onClick={() => handleDelete(editingTask.id)} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl"><Trash2 size={24} /></button>
                    )}
                    <button type="submit" disabled={!taskTitle.trim()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl">{t.save}</button>
                 </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
