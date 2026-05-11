import { GoogleGenAI } from "@google/genai";

type UserSettings = {
  language?: "en" | "es";
  readingLevel?: "simple" | "standard";
  checklistMode?: boolean;
};

type AnalyzeBody = {
  type?: "text" | "image";
  text?: string;
  image?: {
    base64Data?: string;
    mimeType?: string;
  };
  settings?: UserSettings;
};

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    riskLevel: { type: "string", enum: ["low", "medium", "high"] },
    plainLanguageSummary: { type: "string" },
    whyThisMayBeUnsafe: { type: "string" },
    suspiciousSigns: { type: "array", items: { type: "string" } },
    doNotDo: { type: "array", items: { type: "string" } },
    safeNextSteps: { type: "array", items: { type: "string" } },
    verificationScript: { type: "string" },
    trustedVerificationAdvice: { type: "string" },
    confidence: { type: "number" },
    disclaimer: { type: "string" },
  },
  required: [
    "riskLevel",
    "plainLanguageSummary",
    "whyThisMayBeUnsafe",
    "suspiciousSigns",
    "doNotDo",
    "safeNextSteps",
    "verificationScript",
    "trustedVerificationAdvice",
    "confidence",
    "disclaimer",
  ],
};

function getSystemInstruction(settings?: UserSettings) {
  const lang = settings?.language === "es" ? "Spanish" : "English";
  const level =
    settings?.readingLevel === "simple"
      ? "4th-grade level with very simple words"
      : "6th-grade level";
  const mode = settings?.checklistMode
    ? "Focus on a brief, bulleted safety checklist."
    : "Provide a detailed explanation.";

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
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
  }

  const body = (req.body || {}) as AnalyzeBody;
  const type = body.type;

  if (type !== "text" && type !== "image") {
    return res.status(400).json({ error: "Invalid analysis type" });
  }

  if (type === "text" && !body.text?.trim()) {
    return res.status(400).json({ error: "Missing text input" });
  }

  if (type === "image" && (!body.image?.base64Data || !body.image?.mimeType)) {
    return res.status(400).json({ error: "Missing image input" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents:
        type === "text"
          ? `Analyze this message text: "${body.text}"`
          : {
              parts: [
                {
                  inlineData: {
                    data: body.image!.base64Data!,
                    mimeType: body.image!.mimeType!,
                  },
                },
                {
                  text: "Analyze this screenshot for suspicious activity and return the safety report.",
                },
              ],
            },
      config: {
        systemInstruction: getSystemInstruction(body.settings),
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA as any,
      },
    });

    const content = JSON.parse(response.text || "{}");
    return res.status(200).json(content);
  } catch {
    return res.status(502).json({ error: "Analysis failed" });
  }
}
