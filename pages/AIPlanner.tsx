
import React, { useState, useRef, useEffect } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { parseNaturalLanguageToTasks } from '../services/geminiService';
import { 
  Mic, Sparkles, Check, Loader2, ArrowRight, Image as ImageIcon, 
  X, Zap, ListChecks, Calendar, Trash2, Eraser, Info, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

export const AIPlannerPage = () => {
  const { language, addTasksBulk } = useApp();
  const t = TRANSLATIONS[language];
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Partial<Task>[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mikrofonni to'xtatish
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Stop error:", e);
      }
    }
    setIsListening(false);
  };

  const handleMicClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isListening) {
      stopListening();
      return;
    }

    // 1. Browser API-ni tekshirish
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMsg(language === 'uz' ? "Sizning brauzeringiz ovozni qo'llab-quvvatlamaydi. Safari yoki Chrome ishlating." : "Ваш браузер не поддерживает голосовой ввод. Используйте Safari или Chrome.");
      return;
    }

    // 2. Darhol interfeysni "Eshitish" rejimiga o'tkazish
    setIsListening(true);
    setErrorMsg(null);

    try {
      // 3. Instance yaratish
      const recognition = new SpeechRecognition();
      
      // iOS Safari sozlamalari
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'uz' ? 'uz-UZ' : 'ru-RU';
      
      recognition.onstart = () => {
        console.log("Recognition started");
        if (navigator.vibrate) navigator.vibrate(50);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'not-allowed':
            setErrorMsg(language === 'uz' ? "Mikrofonga ruxsat berilmagan. Sozlamalardan Safari mikrofoni yoqing." : "Нет доступа к микрофону. Проверьте настройки Safari.");
            break;
          case 'no-speech':
            setErrorMsg(language === 'uz' ? "Ovoz eshitilmadi. Qaytadan urinib ko'ring." : "Голос не распознан. Попробуйте еще раз.");
            break;
          case 'network':
            setErrorMsg(language === 'uz' ? "Internet bilan muammo." : "Проблема с интернетом.");
            break;
          default:
            setErrorMsg(language === 'uz' ? `Xatolik: ${event.error}` : `Ошибка: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("Recognition ended");
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      
      // 4. MUHIM: recognition.start() hech qanday delay-larsiz bo'lishi kerak
      recognition.start();

    } catch (err) {
      console.error("Recognition execution crash:", err);
      setIsListening(false);
      setErrorMsg(language === 'uz' ? "Mikrofonni ishga tushirishda xatolik." : "Ошибка запуска микрофона.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = (readerEvent.target?.result as string).split(',')[1];
        setAttachedImage({ data: base64, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !attachedImage) return;
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      const newTasks = await parseNaturalLanguageToTasks(inputText, getLocalDate(), language, attachedImage || undefined);
      
      if (newTasks && newTasks.length > 0) {
        const tasksToAdd = newTasks.map(task => ({
          title: String(task.title || "Vazifa"),
          priority: task.priority || 'medium',
          date: task.date || getLocalDate(),
          timeBlock: task.timeBlock || null,
          id: crypto.randomUUID()
        }));
        
        setGeneratedTasks(prev => [...tasksToAdd, ...prev]);
        setInputText(''); 
        setAttachedImage(null);
      } else {
        setErrorMsg(language === 'uz' ? "AI tushunmadi, iltimos aniqroq ayting." : "ИИ не понял, пожалуйста, уточните запрос.");
      }
    } catch (err) {
      setErrorMsg(language === 'uz' ? "Ulanishda xatolik yuz berdi." : "Ошибка сети.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-48 pt-6 select-none touch-none">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
           <Zap size={12} fill="currentColor" /> AI Planner v5.5
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter">
          Planify<span className="ai-gradient-text">AI</span>
        </h1>
        <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
          {t.aiPlannerSubtitle}
        </p>
      </motion.div>

      <div className="neo-card rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-2xl bg-slate-900/40 backdrop-blur-3xl">
        <div className="p-6 md:p-12 space-y-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? t.listening : t.voiceExample}
            className={`w-full h-32 md:h-48 bg-transparent border-none outline-none text-lg md:text-2xl font-bold text-white placeholder:text-slate-800 resize-none leading-relaxed transition-opacity ${isListening ? 'opacity-50' : 'opacity-100'}`}
          />
          
          <AnimatePresence>
            {attachedImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-3 bg-slate-900/80 p-2 pr-4 rounded-2xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                   <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} className="w-full h-full object-cover" alt="preview" />
                </div>
                <span className="text-[10px] text-white font-bold truncate max-w-[80px]">{attachedImage.name}</span>
                <button onClick={() => setAttachedImage(null)} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg"><X size={14}/></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4 h-16 md:w-48">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center justify-center bg-slate-950 text-slate-500 hover:text-indigo-400 rounded-2xl border border-white/5 transition-all active:scale-90"
              >
                <ImageIcon size={24} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              
              <button 
                onClick={handleMicClick} 
                className={`flex items-center justify-center rounded-2xl transition-all active:scale-95 border relative overflow-hidden ${isListening ? 'bg-rose-600 text-white border-transparent shadow-[0_0_30px_rgba(225,29,72,0.4)]' : 'bg-slate-950 text-indigo-500 border-white/5'}`}
              >
                <AnimatePresence>
                  {isListening && (
                    <motion.div 
                      key="waves"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                        <motion.div 
                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="absolute w-full h-full bg-white rounded-full"
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                            className="absolute w-full h-full bg-white rounded-full"
                        />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Mic size={24} className="relative z-10" />
              </button>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={(!inputText.trim() && !attachedImage) || isProcessing}
              className="h-16 px-8 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-500 active:scale-[0.97] transition-all disabled:opacity-20 flex items-center justify-center gap-3 group"
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={18} /> {t.createPlan}</>}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center text-xs font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2"
          >
             <div className="flex items-center gap-2"><AlertCircle size={14} /> {errorMsg}</div>
             <p className="text-[9px] text-slate-500 normal-case opacity-70">iPhone Sozlamalari - Safari - Mikrofon - Ruxsat berish (Allow)</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {generatedTasks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-12 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                 <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400"><ListChecks size={20}/></div>
                 {t.generatedTasks}
              </h3>
              <button onClick={() => setGeneratedTasks([])} className="p-2 text-slate-600 hover:text-rose-500 transition-colors"><Eraser size={18}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {generatedTasks.map((task, idx) => (
                <motion.div 
                    layout key={task.id || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="neo-card p-4 rounded-3xl flex items-center justify-between gap-4 border border-white/5"
                >
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${task.priority === 'high' ? 'text-rose-400' : 'text-indigo-400'}`}>{task.priority}</span>
                        <span className="text-slate-600 text-[8px] font-black">{task.date}</span>
                      </div>
                    </div>
                    <button onClick={() => setGeneratedTasks(prev => prev.filter(t => t.id !== task.id))} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                </motion.div>
              ))}
            </div>

            <button 
                onClick={async () => {
                   setIsProcessing(true);
                   await addTasksBulk(generatedTasks);
                   setGeneratedTasks([]);
                   setIsProcessing(false);
                   setIsSuccess(true);
                   setTimeout(() => setIsSuccess(false), 3000);
                }} 
                className="w-full py-6 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
            >
                {t.addAllTasks} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center z-[999] p-6 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}
              className="bg-indigo-600 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.5)] flex flex-col items-center gap-6 text-center"
            >
              <div className="w-20 h-20 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                <Check strokeWidth={4} size={40} />
              </div>
              <h4 className="text-white font-black text-2xl tracking-tighter">{t.planCreated}</h4>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
