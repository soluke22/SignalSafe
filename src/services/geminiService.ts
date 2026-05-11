import { AnalysisResult, UserSettings } from "../types";

type AnalyzeRequest = {
  type: "text" | "image";
  content?: string;
  image?: {
    base64Data: string;
    mimeType: string;
  };
  settings?: UserSettings;
};

type AnalyzeErrorBody = {
  error?: string;
};

async function analyze(payload: AnalyzeRequest): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let safeError = "Analysis request failed.";
    try {
      const errorBody = (await response.json()) as AnalyzeErrorBody;
      if (typeof errorBody?.error === "string" && errorBody.error.trim()) {
        safeError = errorBody.error;
      }
    } catch {
      // Keep default safe error if response body is not JSON.
    }

    console.error("Analyze request failed", {
      status: response.status,
      error: safeError,
    });
    throw new Error(safeError);
  }

  return (await response.json()) as AnalysisResult;
}

export async function analyzeMessage(content: string, settings?: UserSettings): Promise<AnalysisResult> {
  return analyze({ type: "text", content, settings });
}

export async function analyzeImage(base64Data: string, mimeType: string, settings?: UserSettings): Promise<AnalysisResult> {
  return analyze({ type: "image", image: { base64Data, mimeType }, settings });
}
