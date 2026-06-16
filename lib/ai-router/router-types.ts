export type AiProviderId = "local" | "openai" | "anthropic" | "gemini";

export type AiProviderStatus = "available" | "needs_key" | "disabled";

export type AiTaskType =
  | "product"
  | "architecture"
  | "code"
  | "deployment"
  | "monitoring";

export type AiRouterMode = "local_first" | "cloud_ready" | "enterprise";

export type AiRouterProvider = {
  id: AiProviderId;
  name: string;
  status: AiProviderStatus;
  role: string;
  strengths: string[];
  requiredEnvKeys: string[];
  safetyNotes: string[];
};

export type AiRoutingRule = {
  taskType: AiTaskType;
  label: string;
  primaryProvider: AiProviderId;
  fallbackProviders: AiProviderId[];
  reason: string;
};

export type AiRouterPlan = {
  projectId: string;
  title: string;
  summary: string;
  mode: AiRouterMode;
  providers: AiRouterProvider[];
  rules: AiRoutingRule[];
  safetyPolicies: string[];
  nextActions: string[];
  generatedAt: string;
};