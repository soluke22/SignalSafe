import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserSettings } from "../types";

// Lazy initialize to prevent "API Key must be set" error on load in environments without the key
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("The AI service is missing its security key. If you are the developer, please ensure GEMINI_API_KEY is set in your environment variables. In the AI Studio preview, this key is provided automatically.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskLevel: { type: Type.STRING, description: "Safety risk level: 'low', 'medium', or 'high'" },
    plainLanguageSummary: { type: Type.STRING, description: "A very clear, simple explanation of the message." },
    whyThisMayBeUnsafe: { type: Type.STRING, description: "Specific reasons why the message is flagged." },
    suspiciousSigns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific suspicious signs found in the message." },
    doNotDo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical advice on what the user should NOT do." },
    safeNextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of actionable safe steps." },
    verificationScript: { type: Type.STRING, description: "A script to verify with the official office." },
    trustedVerificationAdvice: { type: Type.STRING, description: "Official channel info or general advice." },
    confidence: { type: Type.NUMBER, description: "Model confidence (0-1)." },
    disclaimer: { type: Type.STRING, description: "Standard safety and legal disclaimer." }
  },
  required: ["riskLevel", "plainLanguageSummary", "whyThisMayBeUnsafe", "safeNextSteps", "verificationScript", "trustedVerificationAdvice", "confidence", "disclaimer"]
};

const getSystemInstruction = (settings?: UserSettings) => {
  const lang = settings?.language === 'es' ? 'Spanish' : 'English';
  const level = settings?.readingLevel === 'simple' ? '4th-grade level' : '6th-grade level';
  const mode = settings?.checklistMode ? 'Focus on a brief, bulleted safety checklist.' : 'Provide a detailed explanation.';

  return `You are SignalSafe, a safety assistant for identifying scams in messages.
OUTPUT LANGUAGE: ${lang}.
TARGET READING LEVEL: ${level}.
FORMAT: ${mode}.
Analyze the input for scams. Identify if it's likely unsafe or a possible scam.
Return results in the specified JSON format.`;
};

export async function analyzeMessage(text: string, settings?: UserSettings): Promise<AnalysisResult> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this message text: "${text}"`,
      config: {
        systemInstruction: getSystemInstruction(settings),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI service.");
    }

    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini analyzeMessage failed:", error);
    
    // Handle specific errors for better UX
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("Quota")) {
      throw new Error("The AI service is currently busy or over quota. Please try again in a few minutes.");
    }
    
    if (error.message?.includes("API Key") || error.message?.includes("invalid API key")) {
        throw new Error("The API key is invalid or missing. If you're on Vercel, check your Environment Variables.");
    }

    throw new Error(error.message || "Failed to analyze message");
  }
}

export async function analyzeImage(base64Data: string, mimeType: string, settings?: UserSettings): Promise<AnalysisResult> {
  try {
    const ai = getAI();
    
    // Extract base64 part if it contains data:image/...;base64,
    const cleanBase64 = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: cleanBase64, mimeType } },
          { text: "Analyze this screenshot for suspicious activity and return the safety report in JSON format." }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(settings),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI service.");
    }

    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini analyzeImage failed:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("Quota")) {
      throw new Error("The AI service is currently busy or over quota. Please try again in a few minutes.");
    }
    throw new Error(error.message || "Failed to analyze image");
  }
}
