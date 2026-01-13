
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Lightbulb, Plus, Trash2, ArrowRightCircle, Hash, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BrainDump = () => {
  const { language, notes, addNote, deleteNote, convertNoteToTask } = useApp();
  const t = TRANSLATIONS[language];
  const [input, setInput] = useState('');

  const handleAdd = () => {
      if(input.trim()) {
          addNote(input);
          setInput('');
      }
  };

  return (
    <div className="glass-card p-6 rounded-[2.5rem] flex flex-col h-full max-h-[500px]">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                   <Lightbulb size={20} fill="currentColor" className="opacity-80" />
                </div>
                <h3 className="font-black text-white tracking-tight uppercase text-xs tracking-[0.2em]">
                    {t.brainDump}
                </h3>
            </div>
            <span className="px-2 py-1 bg-slate-800 text-slate-500 rounded-lg text-[9px] font-black">{notes.length}</span>
        </div>

        <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={t.notePlaceholder}
                    className="w-full pl-5 pr-12 py-3.5 bg-slate-900/50 border border-white/5 rounded-2xl focus:border-indigo-500/50 outline-none text-sm text-white placeholder:text-slate-700 transition-all font-bold"
                />
                <button onClick={handleAdd} className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 active:scale-90">
                    <Plus size={20} />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
            <AnimatePresence initial={false}>
            {notes.map(note => (
                <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-slate-800/30 hover:bg-slate-800/60 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-3 transition-all"
                >
                    <div className="flex gap-3 min-w-0">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 group-hover:scale-150 transition-transform" />
                        <p className="text-sm text-slate-300 leading-relaxed font-semibold break-words">{note.content}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => convertNoteToTask(note.id, note.content)}
                            className="text-indigo-400 hover:bg-indigo-400/10 p-2 rounded-lg transition-colors"
                            title={t.convertToTask}
                        >
                             <ArrowRightCircle size={18} />
                         </button>
                         <button 
                            onClick={() => deleteNote(note.id)}
                            className="text-slate-600 hover:text-rose-500 p-2 rounded-lg transition-colors"
                        >
                             <Trash2 size={18} />
                         </button>
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
            
            {notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <Zap size={32} className="text-slate-500 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.notePlaceholder}</p>
                </div>
            )}
        </div>
    </div>
  );
};
