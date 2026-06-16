export type DeployRiskLevel = "low" | "medium" | "high";

export type DeployCommand = {
  label: string;
  command: string;
  description: string;
};

export type DeployChecklistItem = {
  id: string;
  title: string;
  detail: string;
  required: boolean;
};

export type DeployEnvironmentVariable = {
  key: string;
  required: boolean;
  visibility: "public" | "server";
  description: string;
};

export type DeploymentPack = {
  projectId: string;
  title: string;
  summary: string;
  platform: "vercel";
  riskLevel: DeployRiskLevel;
  riskSummary: string;
  environmentVariables: DeployEnvironmentVariable[];
  commands: DeployCommand[];
  checklist: DeployChecklistItem[];
  rollbackPlan: string[];
  nextActions: string[];
  generatedAt: string;
};