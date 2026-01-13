
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Play, Pause, Square, RefreshCcw, Coffee, Timer } from 'lucide-react';

export const PomodoroTimer = () => {
  const { language, logFocusSession } = useApp();
  const t = TRANSLATIONS[language];

  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (!isBreak) {
      logFocusSession(25);
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => {});
      alert(t.takeBreak);
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
    } else {
      setIsBreak(false);
      setTimeLeft(FOCUS_TIME);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100 
    : ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100;

  return (
    <div className="glass-card p-8 rounded-[3rem] border border-white/5 flex flex-col items-center relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-[60px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-600/10 rounded-full blur-[60px]" />

        <div className="flex items-center gap-3 mb-8 z-10 px-5 py-2 bg-slate-900/50 rounded-full border border-white/5">
            {isBreak ? <Coffee size={16} className="text-emerald-500"/> : <Timer size={16} className="text-rose-500 active-glow"/>}
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{isBreak ? t.takeBreak : t.pomodoro}</span>
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center mb-10 z-10">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96" cy="96" r="85"
                  stroke="rgba(255,255,255,0.03)" strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="96" cy="96" r="85"
                  stroke="currentColor" strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={534}
                  strokeDashoffset={534 - (534 * progress) / 100}
                  className={`${isBreak ? 'text-emerald-500' : 'text-indigo-600'} transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(79,70,229,0.5)]`}
                  strokeLinecap="round"
                />
            </svg>
            <div className="absolute text-5xl font-black text-white tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
            </div>
        </div>

        <div className="flex gap-4 z-10 w-full">
            <button 
                onClick={toggleTimer}
                className={`flex-1 py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
                {isActive ? <><Pause size={20} fill="currentColor" /> {t.pause}</> : <><Play size={20} fill="currentColor" /> {t.startFocus}</>}
            </button>
            <button 
                onClick={resetTimer}
                className="p-5 rounded-2xl bg-slate-800/50 border border-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95 shadow-xl"
            >
                <RefreshCcw size={22} />
            </button>
        </div>
    </div>
  );
};
