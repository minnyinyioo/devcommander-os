export type HandoverPriority = "critical" | "high" | "medium";

export type HandoverSection = {
  id: string;
  title: string;
  priority: HandoverPriority;
  summary: string;
  items: string[];
};

export type HandoverAsset = {
  id: string;
  name: string;
  type:
    | "runtime"
    | "ai"
    | "code"
    | "test"
    | "readiness"
    | "deploy"
    | "monitor"
    | "ops";
  status: "ready" | "needs_review" | "missing";
  description: string;
};

export type ProjectHandoverPack = {
  projectId: string;
  title: string;
  summary: string;
  handoverStatus: "ready_for_internal_handoff" | "needs_review" | "not_ready";
  assets: HandoverAsset[];
  sections: HandoverSection[];
  risks: string[];
  nextOwnerActions: string[];
  generatedAt: string;
};
