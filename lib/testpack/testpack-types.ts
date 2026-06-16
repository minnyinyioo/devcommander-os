export type TestPackCategory =
  | "smoke"
  | "routes"
  | "security"
  | "data"
  | "deployment"
  | "acceptance";

export type TestPackPriority = "critical" | "high" | "medium";

export type TestPackItem = {
  id: string;
  category: TestPackCategory;
  priority: TestPackPriority;
  title: string;
  command?: string;
  expectedResult: string;
  failureRisk: string;
};

export type TestPack = {
  projectId: string;
  title: string;
  summary: string;
  readinessSignal: "safe_to_test" | "needs_review" | "blocked";
  items: TestPackItem[];
  manualChecklist: string[];
  nextActions: string[];
  generatedAt: string;
};