import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RiskLevel, UserSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// ... (ANALYSIS_SCHEMA remains the same)

const getSystemInstruction = (settings?: UserSettings) => {
  const lang = settings?.language === 'es' ? 'Spanish' : 'English';
  const level = settings?.readingLevel === 'simple' ? '4th-grade level with very simple words' : '6th-grade level';
  const mode = settings?.checklistMode ? 'Focus on a brief, bulleted safety checklist.' : 'Provide a detailed explanation.';

  return `You are SignalSafe, a safety assistant for identifying scams in messages.
Your goal is to analyze suspicious messages (texts, emails, screenshots) that look like official communications (civic, legal, housing, SNAP, Medicaid, banking).
OUTPUT LANGUAGE: ${lang}.
TARGET READING LEVEL: ${level}.
FORMAT: ${mode}.
Translate the message into ${lang}.
Identify if it's a scam or potentially unsafe.
BE CAUTIOUS: Use language like "likely unsafe", "possible scam", or "may be risky".
NEVER say "guaranteed scam" or "definitely fake".
NEVER give legal, financial, medical, or official government advice.
ALWAYS advise users to verify through official channels before taking action.
Return results in the specified JSON format.`;
};

export async function analyzeMessage(text: string, settings?: UserSettings): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this message text: "${text}"`,
    config: {
      systemInstruction: getSystemInstruction(settings),
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any,
    },
  });

  const content = JSON.parse(response.text || "{}");
  return content as AnalysisResult;
}

export async function analyzeImage(base64Data: string, mimeType: string, settings?: UserSettings): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this screenshot for suspicious activity and return the safety report." }
      ]
    },
    config: {
      systemInstruction: getSystemInstruction(settings),
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any,
    },
  });

  const content = JSON.parse(response.text || "{}");
  return content as AnalysisResult;
}
