
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function detectGesture(base64Image: string): Promise<{ gesture: string; confidence: number }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: "Identify the primary hand gesture in this frame. Choose ONLY ONE from this list: 'heart', 'peace', 'fist', 'open', 'point', 'thumbs up'. If no clear gesture, return 'none'. Respond with a JSON object containing 'gesture' (string) and 'confidence' (number 0-1)." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gesture: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["gesture", "confidence"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"gesture": "none", "confidence": 0}');
    return result;
  } catch (error) {
    console.error("Gesture detection error:", error);
    return { gesture: "none", confidence: 0 };
  }
}
