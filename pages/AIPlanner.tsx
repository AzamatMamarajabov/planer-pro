
import React, { useState, useRef, useEffect } from 'react';
import { useApp, getLocalDate } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { parseNaturalLanguageToTasks } from '../services/geminiService';
import { 
  Mic, Sparkles, Check, Loader2, Image as ImageIcon, 
  X, ListChecks, Calendar, Trash2, AlertCircle,
  StopCircle, Send, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

export const AIPlannerPage = () => {
  const { language, addTasksBulk, setIsModalActive } = useApp();
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsModalActive(isSuccess || isListening);
    return () => setIsModalActive(false);
  }, [isSuccess, isListening, setIsModalActive]);

  const suggestions = language === 'uz' ? [
    "Ertaga soat 9 da majlis bor",
    "Kitob o'qish va yugurish kerak",
    "Shanba kuni uyni tozalash"
  ] : [
    "Завтра в 9 совещание",
    "Почитать книгу и побегать",
    "Уборка дома в субботу"
  ];

  // Safari uchun ovozni ishga tushirish (Sinxron rejim)
  const handleToggleMic = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMsg(language === 'uz' ? "Brauzeringiz ovozli qidiruvni qo'llab-quvvatlamaydi." : "Ваш браузер не поддерживает голосовой ввод.");
      return;
    }

    // 1. Audio kontekstni uyg'otish (Safari uchun)
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioCtx.resume();
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = true;
      
      // iOS'da uz-UZ ba'zida muammo tug'diradi, shuning uchun fallback qo'shamiz
      recognition.lang = language === 'uz' ? 'uz-UZ' : 'ru-RU';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setInputText(prev => (prev.trim() ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Mic Error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg(language === 'uz' 
            ? "Mikrofon taqiqlangan. Safari sozlamalarida ruxsat bering." 
            : "Микрофон запрещен. Разрешите в настройках Safari.");
        } else if (event.error === 'language-not-supported') {
            // Til qo'llab quvvatlanmasa rus tiliga fallback
            recognition.lang = 'ru-RU';
            recognition.start();
        } else {
          setErrorMsg(language === 'uz' ? "Ovozli xizmatda xatolik." : "Ошибка голосовой службы.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      // Safari uchun eng muhim: start() hech qanday asinxron kutishlarsiz bo'lishi shart
      recognition.start();
      setIsListening(true); // Animatsiyani darhol yoqamiz

    } catch (err) {
      console.error("Speech Recognition crash:", err);
      setIsListening(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !attachedImage) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const newTasks = await parseNaturalLanguageToTasks(inputText, getLocalDate(), language, attachedImage || undefined);
      if (newTasks?.length) {
        setGeneratedTasks(newTasks.map(t => ({ ...t, id: crypto.randomUUID() })));
        setInputText(''); 
        setAttachedImage(null);
      } else {
        setErrorMsg(language === 'uz' ? "AI kiritilgan ma'lumotni tushunmadi." : "ИИ не понял запрос.");
      }
    } catch (err) {
      setErrorMsg(language === 'uz' ? "AI bilan bog'lanishda xatolik yuz berdi." : "Ошибка связи с ИИ.");
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-48 pt-4 flex flex-col gap-6">
      
      <div className="flex justify-between items-end mb-2">
          <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Planify<span className="ai-gradient-text">AI</span></h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{t.proAssistant}</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl border transition-all duration-500 flex items-center gap-2 ${isListening ? 'bg-rose-500/10 border-rose-500 active-glow' : 'bg-slate-900 border-white/5'}`}>
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isListening ? 'text-rose-400' : 'text-slate-600'}`}>{isListening ? t.listening : t.readyStatus}</span>
          </div>
      </div>

      <div className="flex flex-col gap-6">
          <div className={`neo-card rounded-[3rem] border relative overflow-hidden transition-all duration-700 ${isListening ? 'border-rose-500/30 bg-slate-950/80 shadow-[0_0_100px_rgba(244,63,94,0.2)]' : 'border-white/5 bg-slate-900/40 shadow-2xl'}`}>
              
              <AnimatePresence>
                  {isListening && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 z-[500] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center"
                        onClick={handleToggleMic}
                      >
                          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30">
                              <Mic size={40} className="text-rose-500" />
                          </motion.div>
                          <p className="mt-6 text-white font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">{t.listening}</p>
                          <button className="mt-10 px-6 py-3 bg-white/5 rounded-2xl text-[10px] text-slate-500 font-black uppercase tracking-widest border border-white/5">To'xtatish</button>
                      </motion.div>
                  )}
              </AnimatePresence>

              <div className="p-8 md:p-12 space-y-8">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t.aiPlannerSubtitle}
                    className="w-full h-40 bg-transparent border-none outline-none text-2xl md:text-3xl font-bold text-white placeholder:text-slate-800 resize-none leading-tight"
                  />
                  
                  {!inputText && !attachedImage && (
                      <div className="flex flex-wrap gap-2">
                          {suggestions.map((s, i) => (
                              <button key={i} onClick={() => setInputText(s)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] text-slate-500 font-black uppercase tracking-widest transition-all">{s}</button>
                          ))}
                      </div>
                  )}
              </div>

              <div className="px-8 md:px-12 pb-12 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                      <button onClick={handleToggleMic} className={`w-14 h-14 rounded-[1.5rem] transition-all active:scale-90 flex items-center justify-center border shadow-2xl ${isListening ? 'bg-rose-600 text-white' : 'bg-slate-950 text-indigo-400 border-white/5'}`}>
                          {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-[1.5rem] bg-slate-950 text-slate-500 hover:text-white border border-white/5 flex items-center justify-center active:scale-90 transition-all">
                        <ImageIcon size={24} />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            const base64 = (re.target?.result as string).split(',')[1];
                            setAttachedImage({ data: base64, mimeType: file.type, name: file.name });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" accept="image/*" />
                  </div>

                  <button 
                    onClick={handleGenerate} 
                    disabled={(!inputText.trim() && !attachedImage) || isProcessing}
                    className="flex-1 h-14 group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-[1.5rem] transition-all hover:scale-[1.02] hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 border-t border-white/20 shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isProcessing ? <Loader2 size={22} className="animate-spin" /> : <><Sparkles size={18} /> {t.createPlan}</>}
                  </button>
              </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-400 text-xs font-black flex items-start gap-4 shadow-xl">
                 <AlertCircle size={20} className="shrink-0 mt-0.5" /> 
                 <div className="space-y-1">
                    <p className="font-black">Xatolik yuz berdi</p>
                    <p className="opacity-80 font-bold">{errorMsg}</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {generatedTasks.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20"><ListChecks size={24}/></div>
                     <div><h3 className="text-2xl font-black text-white tracking-tighter">{t.generatedTasks}</h3></div>
                  </div>
                  <button onClick={() => setGeneratedTasks([])} className="p-3 text-slate-500 hover:text-rose-500 bg-white/5 rounded-2xl"><Trash2 size={20} /></button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {generatedTasks.map((task, idx) => (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={idx} className="bg-slate-900/60 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between gap-5 group">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-rose-500 active-glow' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <input type="text" value={task.title} onChange={(e) => { const n = [...generatedTasks]; n[idx].title = e.target.value; setGeneratedTasks(n); }} className="bg-transparent text-white font-black text-xl w-full outline-none" />
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">{task.date}</span>
                             <button onClick={() => setGeneratedTasks(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><X size={20} /></button>
                        </div>
                    </motion.div>
                  ))}
                </div>

                <button onClick={async () => { setIsProcessing(true); await addTasksBulk(generatedTasks); setGeneratedTasks([]); setIsProcessing(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }} className="w-full h-20 bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2.5rem] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4">
                    {t.addAllTasks} <Send size={24} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 1.1, opacity: 0 }} className="bg-[#0F1115] border border-white/10 p-12 rounded-[4rem] shadow-2xl flex flex-col items-center gap-8 text-center max-w-sm">
              <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]"><Check strokeWidth={4} size={48} /></div>
              <div><h4 className="text-white font-black text-3xl tracking-tighter mb-2">{t.planCreated}</h4><p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{t.allTasksAdded}</p></div>
              <button onClick={() => setIsSuccess(false)} className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all">{language === 'uz' ? 'Yopish' : 'Закрыть'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
