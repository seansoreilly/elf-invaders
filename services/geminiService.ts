import { GoogleGenAI } from "@google/genai";

const getSantaFeedback = async (score: number, win: boolean): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Santa is currently feeding the reindeer (No API Key).";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Choose model based on guidelines
    const model = 'gemini-3-flash-preview'; 

    const prompt = `
      You are Santa Claus. 
      A player just finished playing "Elf Invaders" (a Space Invaders clone where elves rebelled).
      Their Score: ${score}.
      Result: ${win ? "They saved Christmas!" : "The elves took over."}
      
      Write a very short (max 2 sentences), funny, festive comment evaluating their performance for the "Naughty or Nice" list.
      Use emojis.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Ho ho ho! Merry gaming!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Santa's communication lines are frozen! (API Error)";
  }
};

export { getSantaFeedback };