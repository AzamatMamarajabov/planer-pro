import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductivityAdvice } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { Bot, Sparkles, Send } from 'lucide-react';
import { AiAdvice } from '../types';

export const AICoachPage = () => {
  const { language, tasks, habits, userName } = useApp();
  const t = TRANSLATIONS[language];
  
  const [loading, setLoading] = useState(false);
  const [adviceHistory, setAdviceHistory] = useState<AiAdvice[]>([]);

  const handleAskAI = async () => {
    setLoading(true);
    const adviceText = await getProductivityAdvice(tasks, habits, language);
    
    setAdviceHistory(prev => [
      ...prev, 
      { text: adviceText, timestamp: Date.now() }
    ]);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white mb-4 shadow-lg shadow-indigo-200">
          <Bot size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">{t.aiCoach}</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          {language === 'uz' 
            ? "Gemini AI tomonidan quvvatlangan shaxsiy samaradorlik tahlili." 
            : "Персональный анализ продуктивности на базе Gemini AI."}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 p-6 space-y-6 bg-slate-50/30">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%]">
              <p className="text-slate-700">
                {language === 'uz' 
                  ? `Salom, ${userName}! Bugun qanday yordam bera olaman? Men sizning vazifalaringiz va odatlaringizni tahlil qila olaman.`
                  : `Привет, ${userName}! Чем могу помочь сегодня? Я могу проанализировать твои задачи и привычки.`
                }
              </p>
            </div>
          </div>

          {adviceHistory.map((item, idx) => (
             <div key={idx} className="animate-fade-in">
                {/* User Prompt (Simulated) */}
                <div className="flex gap-4 flex-row-reverse mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    {userName[0]}
                  </div>
                  <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md max-w-[80%]">
                    <p>{t.aiPrompt}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%]">
                    <p className="text-slate-700 leading-relaxed">{item.text}</p>
                  </div>
                </div>
             </div>
          ))}

          {loading && (
             <div className="flex gap-4 animate-pulse">
               <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Sparkles size={16} />
                </div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-400 text-sm">
                 {t.aiLoading}
               </div>
             </div>
          )}
        </div>

        {/* Action Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <button
            onClick={handleAskAI}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            {t.askAi}
          </button>
        </div>
      </div>
    </div>
  );
};
