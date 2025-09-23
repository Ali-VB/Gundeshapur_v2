
import { GoogleGenAI } from '@google/genai';

// IMPORTANT: As per security best practices and platform requirements,
// the API key is sourced EXCLUSIVELY from the environment variable `import.meta.env.VITE_GEMINI_API_KEY`.
// This variable must be configured in your deployment environment (e.g., Netlify, Vercel).
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("VITE_GEMINI_API_KEY environment variable not set. AI features will be disabled.");
}

export const generateText = async (prompt: string): Promise<string> => {
    if (!ai) {
        return "AI service is not configured. Please ensure the VITE_GEMINI_API_KEY is set in your environment variables.";
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert librarian's assistant. You help library managers with book suggestions, summaries, and other library-related tasks. Your responses should be helpful, concise, and professional.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        return "Sorry, I encountered an error while processing your request. Please check the console for details.";
    }
};
