import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from "../types";

export const extractEventDetails = async (text: string, imageDataUrl?: string | null): Promise<CalendarEvent> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const now = new Date();
  const systemInstruction = `
    You are an expert personal assistant specializing in scheduling.
    Current Reference Time: ${now.toISOString()} (${now.toLocaleDateString()} ${now.toLocaleTimeString()}).
    
    Your task is to extract event details from the user's text or image input.
    - Infer the correct year if omitted.
    - If "tomorrow" or "next Friday" is used, calculate the specific ISO date based on the Current Reference Time.
    - If no duration is specified, assume 1 hour.
    - If no time is specified for the start, assume it's an all-day event or set to 09:00 local time if ambiguous.
    - Format dates as full ISO 8601 strings (e.g., 2024-05-21T14:30:00).
    - If a specific piece of information (like location or description) is missing, return an empty string for that field.
    - If the input is a screenshot or image, extract all relevant event details visible in the image.
  `;

  let contents: any = text;

  if (imageDataUrl) {
    const matches = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const data = matches[2];

      contents = {
        parts: [
          { text: text || "Extract event details from this image." },
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          }
        ]
      };
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A concise title for the event" },
          startDate: { type: Type.STRING, description: "Start date and time in ISO 8601 format" },
          endDate: { type: Type.STRING, description: "End date and time in ISO 8601 format" },
          location: { type: Type.STRING, description: "Physical location or URL" },
          description: { type: Type.STRING, description: "Any additional details, agenda, or context found in the text" },
        },
        required: ["title", "startDate", "endDate"],
      },
    },
  });

  const jsonText = response.text;
  if (!jsonText) {
    throw new Error("No response from AI");
  }

  try {
    const data = JSON.parse(jsonText) as CalendarEvent;
    return data;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to parse event details");
  }
};