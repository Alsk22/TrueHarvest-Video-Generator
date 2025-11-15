import { GoogleGenAI } from "@google/genai";
import type { VideoAspectRatio } from '../types';

// This function creates a new AI instance. It should be called before each API request
// to ensure it uses the most up-to-date API key selected by the user.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAiDescription = async (verseText: string, verseReference: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `
        Your primary source for biblical text and interpretation MUST be https://www.biblegateway.com/.
        Based on the Bible verse "${verseText} (${verseReference})", provide a clear, biblically accurate interpretation grounded in information from Bible Gateway.
        Highlight the love of Jesus, His sacrifice for all people, and His message of hope, redemption, and salvation.
        Explain the meaning in simple, uplifting, and spiritually encouraging words so that anyone can understand—believers or non-believers.
        Do not add any titles or introductory phrases like "Here is the interpretation:". Just provide the paragraph of interpretation.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};

export const synthesizeFinalExplanation = async (userDescription: string, aiDescription: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `
        You are an expert at concise and powerful writing for video. Your task is to synthesize two pieces of text about a Bible verse into a single, short, and impactful paragraph for on-screen display.
        
        Combine the personal, emotional heart of the 'User's Description' with the theological clarity of the 'AI Suggestion'. 
        
        The final result must be **very short**, easy to read in a video, and emotionally resonant. Do not add any titles, labels, or quotation marks. Just provide the final, synthesized paragraph.

        ---
        **User's Description (The Heart):**
        "${userDescription}"
        ---
        **AI Suggestion (The Clarity):**
        "${aiDescription}"
        ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};

export const generateInspirationalVideo = async (prompt: string, aspectRatio: VideoAspectRatio) => {
    const ai = getAiClient();
    const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });
    return operation;
};

export const pollVideoStatus = async (operation: any) => {
    const ai = getAiClient();
    return await ai.operations.getVideosOperation({ operation: operation });
};