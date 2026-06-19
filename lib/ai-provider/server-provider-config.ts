import type {
  AiProviderStatus,
  AiProviderStatusResponse,
} from "./provider-types";

function hasServerEnv(name: string): boolean {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

function providerStatus(): AiProviderStatus[] {
  return [
    {
      id: "openai",
      label: "OpenAI",
      configured: hasServerEnv("OPENAI_API_KEY"),
      serverSideOnly: true,
      envVarName: "OPENAI_API_KEY",
      capabilities: ["chat", "code_generation", "debugging", "planning"],
      notes: "Use only on the server. Never expose this key with NEXT_PUBLIC_.",
    },
    {
      id: "anthropic",
      label: "Anthropic Claude",
      configured: hasServerEnv("ANTHROPIC_API_KEY"),
      serverSideOnly: true,
      envVarName: "ANTHROPIC_API_KEY",
      capabilities: ["chat", "code_generation", "debugging", "planning"],
      notes: "Use only on the server. Never expose this key to client components.",
    },
    {
      id: "gemini",
      label: "Google Gemini",
      configured: hasServerEnv("GEMINI_API_KEY"),
      serverSideOnly: true,
      envVarName: "GEMINI_API_KEY",
      capabilities: ["chat", "code_generation", "summarization", "planning"],
      notes: "Use only on the server. Keep it out of browser-visible env vars.",
    },
    {
      id: "local",
      label: "Local fallback",
      configured: true,
      serverSideOnly: false,
      envVarName: "none",
      capabilities: ["planning", "summarization"],
      notes: "Always available as deterministic fallback when no paid provider is configured.",
    },
  ];
}

export function getAiProviderStatus(): AiProviderStatusResponse {
  return {
    generatedAt: new Date().toISOString(),
    providers: providerStatus(),
    security: {
      exposesSecretsToClient: false,
      publicEnvKeysAllowed: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ],
      privateEnvKeysNeverReturned: [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "GEMINI_API_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ],
    },
  };
}
