export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface UserSettings {
  language: 'en' | 'es';
  appearance: 'system' | 'light' | 'dark';
  readingLevel: 'simple' | 'standard';
  textSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  readAloud: boolean;
  checklistMode: boolean;
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  plainLanguageSummary: string;
  whyThisMayBeUnsafe: string;
  suspiciousSigns: string[];
  doNotDo: string[];
  safeNextSteps: string[];
  verificationScript: string;
  trustedVerificationAdvice: string;
  confidence: number;
  disclaimer: string;
}

export interface SavedAnalysis extends AnalysisResult {
  id: string;
  timestamp: number;
  originalText?: string;
  imageUrl?: string;
}
