import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    // Ensure history starts with 'user' role as required by Gemini API
    let formattedHistory = [...history];
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory = formattedHistory.slice(1);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are a helpful Islamic assistant. You provide guidance, answer questions about Islam, Quran, Hadith, and daily prayers. Always be respectful, accurate, and cite sources when possible. If you don't know something, admit it.",
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to get response from AI.");
  }
}
