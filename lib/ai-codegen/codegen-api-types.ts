export type AiCodeGenerationProvider = "local" | "openai";

export type AiGeneratedFileRisk = "safe" | "review" | "sensitive";

export type AiGeneratedCodeFile = {
  path: string;
  language: string;
  purpose: string;
  riskLevel: AiGeneratedFileRisk;
  content: string;
};

export type AiCodeGenerationRequest = {
  prompt: string;
  projectId?: string;
  provider?: AiCodeGenerationProvider;
  maxFiles?: number;
};

export type AiCodeGenerationResponse = {
  generatedAt: string;
  provider: AiCodeGenerationProvider;
  fallbackUsed: boolean;
  summary: string;
  runInstructions: string[];
  files: AiGeneratedCodeFile[];
  safety: {
    secretsReturned: false;
    requiresHumanReview: boolean;
    warnings: string[];
  };
};

export type AiCodeGenerationErrorResponse = {
  error: string;
  message: string;
};
