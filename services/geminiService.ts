
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Language } from "../types";

// Helper to get Gemini client
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProductivityAdvice = async (tasks: any[], habits: any[], language: Language): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User has ${tasks.length} tasks and ${habits.length} habits. Language: ${language}. Give 1 sentence advice.`,
      config: { systemInstruction: "Productivity coach. Be brief.", temperature: 0.7 }
    });
    return response.text || "";
  } catch (error) { return "AI connection error."; }
};

export const generateDailyBriefing = async (tasks: Task[], language: Language): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Briefly summarize tasks: ${tasks.map(t => t.title).join(", ")}`,
            config: { systemInstruction: "Brief daily assistant.", temperature: 0.7 }
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
        const systemInstruction = `
            You are a professional AI planner. 
            Convert user input into a unique JSON array of tasks. 
            Current Date: ${currentDate}.
            CRITICAL: If the user provides multiple tasks, ensure EACH object in the array has its OWN unique title, priority, and date based on the input. DO NOT duplicate data across items.
        `;

        const parts: any[] = [{ text: `Generate distinct tasks from this input: "${text}"` }];
        if (imageData) {
            parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
        }

        // Using gemini-3-flash-preview for high accuracy in structured output and speed
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'Unique title of the task' },
                            priority: { type: Type.STRING, enum: ['low', 'medium', 'high'], description: 'Priority level' },
                            date: { type: Type.STRING, description: 'YYYY-MM-DD format' },
                            timeBlock: { type: Type.STRING, description: 'Optional HH:MM format' }
                        },
                        required: ['title', 'priority', 'date'],
                        propertyOrdering: ['title', 'priority', 'date', 'timeBlock']
                    }
                },
                temperature: 0.1 
            }
        });

        const jsonString = response.text || "[]";
        const result = JSON.parse(jsonString);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("AI Planning Error:", error);
        return [];
    }
};
