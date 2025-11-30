
import { GoogleGenAI } from "@google/genai";
import { Player, Match } from '../types';

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing from environment variables");
      throw new Error("API Key missing");
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const askCoach = async (
  query: string,
  players: Player[],
  recentMatches: Match[]
): Promise<string> => {
  try {
    const ai = getGenAI();
    
    // Prepare context
    const rosterSummary = players.map(p => 
      `- ${p.name} (${p.role}): ${p.battingStyle}, ${p.bowlingStyle}. Avg: ${p.average}`
    ).join('\n');

    const matchSummary = recentMatches.slice(0, 3).map(m => 
      `- vs ${m.opponent} (${m.result || 'Upcoming'})`
    ).join('\n');

    const systemPrompt = `
      You are the elite Head Coach of the "Indian Strikers" cricket team. 
      Your tone is encouraging, strategic, and professional.
      
      Team Roster Context:
      ${rosterSummary}

      Recent/Upcoming Matches:
      ${matchSummary}

      User Query: ${query}

      Provide a concise, strategic answer based on the roster provided. If asked for a lineup, pick the best balanced team from the roster.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        systemInstruction: "You are a cricket coach. Keep answers under 150 words unless asked for a full strategy."
      }
    });

    return response.text || "I couldn't analyze that strategy right now, skipper.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the strategy server. Please check your API key.";
  }
};