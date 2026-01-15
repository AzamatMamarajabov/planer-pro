
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Language } from "../types";

// AI instansiyasini har doim yangi kalit bilan olish ( guidelines bo'yicha )
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProductivityAdvice = async (tasks: any[], habits: any[], language: Language): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User has ${tasks.length} tasks and ${habits.length} habits. Language: ${language}. Give 1 sentence productivity advice.`,
      config: { systemInstruction: "You are a world-class productivity coach. Be concise and motivational.", temperature: 0.7 }
    });
    return response.text || "";
  } catch (error) { 
    console.error("Gemini Coach Error:", error);
    return "AI bilan bog'lanishda xatolik yuz berdi."; 
  }
};

export const generateDailyBriefing = async (tasks: Task[], language: Language): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize today's plan: ${tasks.map(t => t.title).join(", ")}. Language: ${language}`,
            config: { systemInstruction: "You are a professional personal assistant. Provide a very brief, helpful morning briefing.", temperature: 0.7 }
        });
        return response.text || "";
    } catch (error) { return ""; }
};

export const parseNaturalLanguageToTasks = async (
    text: string,
    currentDate: string,
    language: Language,
    imageData?: { data: string; mimeType: string }
): Promise<Partial<Task>[]> => {
    try {
        const ai = getAi();
        // Murakkab tahlil uchun Pro modelidan foydalanamiz
        const modelName = 'gemini-3-pro-preview';
        
        const systemInstruction = `
            You are an advanced AI Planner Assistant.
            Extract structured tasks from natural language or images.
            Current Date: ${currentDate}.
            Language: ${language === 'uz' ? 'Uzbek' : 'Russian'}.
            
            Rules:
            1. Extract each distinct task with its details.
            2. Infer priority: 'high' (urgent words like "tez", "muhim", "srochno"), 'medium' (default), 'low'.
            3. Infer date: If "ertaga" or "tomorrow", use date after ${currentDate}.
            4. Extract time: "soat 9 da" -> "09:00".
            5. Professionalize the title: Correct typos and make it clear.
            
            Return a valid JSON array.
        `;

        const parts: any[] = [{ text: `Input: "${text}"` }];
        if (imageData) {
            parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                            date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                            timeBlock: { type: Type.STRING, description: 'HH:MM or null' }
                        },
                        required: ['title', 'priority', 'date']
                    }
                },
                temperature: 0.1 
            }
        });

        const result = JSON.parse(response.text || "[]");
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Gemini Parsing Error:", error);
        throw error;
    }
};
