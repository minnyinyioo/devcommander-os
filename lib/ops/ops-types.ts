export type OpsPriority = "critical" | "high" | "medium";

export type OpsRunbookSection = {
  id: string;
  title: string;
  priority: OpsPriority;
  summary: string;
  checklist: string[];
};

export type OpsRunbook = {
  projectId: string;
  title: string;
  summary: string;
  operatingStage: "pre_launch" | "launch_ready" | "post_launch";
  sections: OpsRunbookSection[];
  escalationRules: string[];
  weeklyReview: string[];
  nextActions: string[];
  generatedAt: string;
};
