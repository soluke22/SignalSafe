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

const MODEL_NAME = "gemini-2.5-flash";

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
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
  }

  let body: AnalyzeBody;
  try {
    body =
      typeof req.body === "string"
        ? (JSON.parse(req.body) as AnalyzeBody)
        : ((req.body || {}) as AnalyzeBody);
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload." });
  }

  const type = body.type;

  if (type !== "text" && type !== "image") {
    return res.status(400).json({ error: "Invalid payload: type must be 'text' or 'image'." });
  }

  if (type === "text" && !body.text?.trim()) {
    return res.status(400).json({ error: "Invalid payload: text is required for text analysis." });
  }

  if (type === "image" && (!body.image?.base64Data || !body.image?.mimeType)) {
    return res.status(400).json({ error: "Invalid payload: image.base64Data and image.mimeType are required for image analysis." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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

    const rawText = response.text;
    if (!rawText) {
      console.error("Gemini response missing text", {
        type,
        model: MODEL_NAME,
      });
      return res.status(502).json({ error: "Upstream model returned an empty response." });
    }

    let content: unknown;
    try {
      content = JSON.parse(rawText);
    } catch {
      console.error("Gemini response was not valid JSON", {
        type,
        model: MODEL_NAME,
      });
      return res.status(502).json({ error: "Upstream model returned an invalid response." });
    }

    return res.status(200).json(content);
  } catch (error: unknown) {
    console.error("Gemini analysis call failed", {
      type,
      model: MODEL_NAME,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return res.status(502).json({ error: "Model analysis failed. Please try again." });
  }
}
