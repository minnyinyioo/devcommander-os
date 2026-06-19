import type { AiProviderId } from "./provider-types";

export type AiProviderValidationLevel = "pass" | "warning" | "blocked";

export type AiProviderKeyValidation = {
  id: AiProviderId;
  label: string;
  envVarName: string;
  configured: boolean;
  level: AiProviderValidationLevel;
  message: string;
  recommendations: string[];
};

export type AiProviderValidationResponse = {
  generatedAt: string;
  safeToUseRealProviders: boolean;
  results: AiProviderKeyValidation[];
  security: {
    returnsSecretValues: false;
    blocksPublicProviderKeys: boolean;
    checkedPublicKeyNames: string[];
  };
};

type ProviderRule = {
  id: AiProviderId;
  label: string;
  envVarName: string;
  publicEnvVarName: string;
  expectedPrefixes: string[];
};

const PROVIDER_RULES: ProviderRule[] = [
  {
    id: "openai",
    label: "OpenAI",
    envVarName: "OPENAI_API_KEY",
    publicEnvVarName: "NEXT_PUBLIC_OPENAI_API_KEY",
    expectedPrefixes: ["sk-"],
  },
  {
    id: "anthropic",
    label: "Anthropic Claude",
    envVarName: "ANTHROPIC_API_KEY",
    publicEnvVarName: "NEXT_PUBLIC_ANTHROPIC_API_KEY",
    expectedPrefixes: ["sk-ant-"],
  },
  {
    id: "gemini",
    label: "Google Gemini",
    envVarName: "GEMINI_API_KEY",
    publicEnvVarName: "NEXT_PUBLIC_GEMINI_API_KEY",
    expectedPrefixes: ["AIza"],
  },
];

function readEnv(name: string): string {
  const value = process.env[name];

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function looksLikePlaceholder(value: string): boolean {
  const lowered = value.toLowerCase();

  return (
    lowered.includes("your_") ||
    lowered.includes("replace") ||
    lowered.includes("example") ||
    lowered.includes("placeholder") ||
    lowered === "changeme" ||
    lowered === "todo"
  );
}

function validateProvider(rule: ProviderRule): AiProviderKeyValidation {
  const privateValue = readEnv(rule.envVarName);
  const publicValue = readEnv(rule.publicEnvVarName);

  if (publicValue.length > 0) {
    return {
      id: rule.id,
      label: rule.label,
      envVarName: rule.envVarName,
      configured: privateValue.length > 0,
      level: "blocked",
      message: `${rule.publicEnvVarName} is set. Provider keys must never use NEXT_PUBLIC_.`,
      recommendations: [
        `Remove ${rule.publicEnvVarName} from Vercel and local environments.`,
        `Use ${rule.envVarName} as a server-only environment variable.`,
        "Rotate the key if it was ever exposed to the browser.",
      ],
    };
  }

  if (privateValue.length === 0) {
    return {
      id: rule.id,
      label: rule.label,
      envVarName: rule.envVarName,
      configured: false,
      level: "warning",
      message: `${rule.label} is not configured yet.`,
      recommendations: [
        `Add ${rule.envVarName} only when you are ready to enable real provider calls.`,
        "Local fallback can continue working without a paid provider key.",
      ],
    };
  }

  if (looksLikePlaceholder(privateValue)) {
    return {
      id: rule.id,
      label: rule.label,
      envVarName: rule.envVarName,
      configured: true,
      level: "blocked",
      message: `${rule.envVarName} looks like a placeholder, not a real server key.`,
      recommendations: [
        `Replace ${rule.envVarName} with a real server-only key.`,
        "Do not commit the key to Git.",
        "Do not put the key in .env.example.",
      ],
    };
  }

  if (privateValue.length < 20) {
    return {
      id: rule.id,
      label: rule.label,
      envVarName: rule.envVarName,
      configured: true,
      level: "blocked",
      message: `${rule.envVarName} is too short to be a valid provider key.`,
      recommendations: [
        "Check the copied key value.",
        "Keep the key server-only.",
        "Never expose this key to client components.",
      ],
    };
  }

  const prefixLooksValid = rule.expectedPrefixes.some((prefix) =>
    privateValue.startsWith(prefix),
  );

  if (!prefixLooksValid) {
    return {
      id: rule.id,
      label: rule.label,
      envVarName: rule.envVarName,
      configured: true,
      level: "warning",
      message: `${rule.envVarName} is present, but the prefix does not match the common ${rule.label} pattern.`,
      recommendations: [
        "Confirm the key belongs to the selected provider.",
        "Do not test real provider calls until this is confirmed.",
        "This warning does not expose the key value.",
      ],
    };
  }

  return {
    id: rule.id,
    label: rule.label,
    envVarName: rule.envVarName,
    configured: true,
    level: "pass",
    message: `${rule.label} server key is configured safely.`,
    recommendations: [
      "Keep this key server-only.",
      "Do not expose it with NEXT_PUBLIC_.",
      "Use provider calls only through server-side routes.",
    ],
  };
}

export function validateAiProviderKeys(): AiProviderValidationResponse {
  const results = PROVIDER_RULES.map(validateProvider);
  const blocked = results.some((result) => result.level === "blocked");

  return {
    generatedAt: new Date().toISOString(),
    safeToUseRealProviders: !blocked,
    results,
    security: {
      returnsSecretValues: false,
      blocksPublicProviderKeys: true,
      checkedPublicKeyNames: PROVIDER_RULES.map((rule) => rule.publicEnvVarName),
    },
  };
}
