import { GoogleGenAI } from "@google/genai";

// Initialize the client safely.
// Note: In a real production environment, ensure your API key is restricted or handled via a backend proxy.
const apiKey = process.env.API_KEY || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const suggestMergedFilename = async (fileNames: string[]): Promise<string> => {
  if (!ai) {
    throw new Error("API Key not configured");
  }

  try {
    const prompt = `
      I am merging the following PDF files:
      ${fileNames.map(n => `- ${n}`).join('\n')}
      
      Suggest a short, professional, and descriptive filename for the merged result. 
      Do not include the .pdf extension in the response. 
      Return ONLY the filename string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate filename suggestion");
  }
};
