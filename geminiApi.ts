
import { GoogleGenAI } from '@google/genai';
import { log } from './loggingService';

// IMPORTANT: As per security best practices and platform requirements,
// the API key is sourced EXCLUSIVELY from the environment variable `process.env.API_KEY`.
// This variable must be configured in your deployment environment (e.g., Netlify, Vercel).
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

export const generateText = async (prompt: string): Promise<string> => {
    if (!ai) {
        const message = "AI service is not configured. Please ensure the API_KEY is set in your environment variables.";
        log.addLog('ERROR', message);
        return message;
    }
    try {
        log.addLog('INFO', `Sending prompt to Gemini: "${prompt.substring(0, 50)}..."`);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert librarian's assistant. You help library managers with book suggestions, summaries, and other library-related tasks. Your responses should be helpful, concise, and professional.",
            },
        });
        log.addLog('INFO', `Received response from Gemini.`);
        return response.text;
    } catch (error: any) {
        console.error("Gemini API error:", error);
        log.addLog('ERROR', `Gemini API error: ${error.message}`);
        return "Sorry, I encountered an error while processing your request. Please check the console for details.";
    }
};