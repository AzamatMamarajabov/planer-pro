
import { GoogleGenAI } from "@google/genai";

const APP_URL = "https://planer-prov1.vercel.app/";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot is active!');
  }

  const { message } = req.body;

  if (message && message.text === '/start') {
    try {
      // Gemini AI yordamida foydalanuvchi uchun chiroyli salomlashuv yaratamiz
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Siz PlanifyAI Pro yordamchisining Telegram botisiz. Foydalanuvchi hozirgina botni ishga tushirdi (/start). Unga juda chiroyli, qisqa (2-3 jumla) va motivatsion salomlashuv yozing va ilovani ochishini taklif qiling. Til: O'zbekcha.",
      });

      const welcomeText = response.text || "Xush kelibsiz! PlanifyAI bilan kuningizni samarali rejalashtiring. 🚀";

      // Telegram API orqali javob yuborish
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: welcomeText,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Ilovani ochish 🚀",
                  web_app: { url: APP_URL }
                }
              ]
            ]
          }
        })
      });
    } catch (error) {
      console.error('Bot error:', error);
    }
  }

  return res.status(200).send('OK');
}
