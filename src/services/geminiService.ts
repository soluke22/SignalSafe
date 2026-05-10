import { AnalysisResult, UserSettings } from "../types";

type AnalyzeRequest = {
  type: "text" | "image";
  text?: string;
  image?: {
    base64Data: string;
    mimeType: string;
  };
  settings?: UserSettings;
};

async function analyze(payload: AnalyzeRequest): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Analysis request failed");
  }

  return (await response.json()) as AnalysisResult;
}

export async function analyzeMessage(text: string, settings?: UserSettings): Promise<AnalysisResult> {
  return analyze({ type: "text", text, settings });
}

export async function analyzeImage(base64Data: string, mimeType: string, settings?: UserSettings): Promise<AnalysisResult> {
  return analyze({ type: "image", image: { base64Data, mimeType }, settings });
}
