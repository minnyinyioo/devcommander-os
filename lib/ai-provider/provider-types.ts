export type AiProviderId = "openai" | "anthropic" | "gemini" | "local";

export type AiProviderCapability =
  | "chat"
  | "code_generation"
  | "debugging"
  | "planning"
  | "summarization";

export type AiProviderStatus = {
  id: AiProviderId;
  label: string;
  configured: boolean;
  serverSideOnly: boolean;
  envVarName: string;
  capabilities: AiProviderCapability[];
  notes: string;
};

export type AiProviderStatusResponse = {
  generatedAt: string;
  providers: AiProviderStatus[];
  security: {
    exposesSecretsToClient: false;
    publicEnvKeysAllowed: string[];
    privateEnvKeysNeverReturned: string[];
  };
};
