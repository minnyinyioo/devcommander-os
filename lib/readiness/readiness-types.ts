export type ReadinessCategory =
  | "product"
  | "architecture"
  | "security"
  | "delivery"
  | "operations";

export type ReadinessResult = "pass" | "warning" | "fail";

export type ReadinessStatus =
  | "ready_for_development"
  | "needs_architecture_review"
  | "needs_security_review"
  | "ready_for_deployment"
  | "not_production_ready";

export type ReadinessItem = {
  id: string;
  category: ReadinessCategory;
  title: string;
  result: ReadinessResult;
  detail: string;
  recommendation: string;
};

export type ReadinessReport = {
  projectId: string;
  status: ReadinessStatus;
  statusLabel: string;
  summary: string;
  overallScore: number;
  categoryScores: Record<ReadinessCategory, number>;
  items: ReadinessItem[];
  nextActions: string[];
  generatedAt: string;
};