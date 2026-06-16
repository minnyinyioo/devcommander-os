export type MonitorSignalStatus = "healthy" | "warning" | "critical";

export type MonitorRiskLevel = "low" | "medium" | "high";

export type MonitorSignal = {
  id: string;
  title: string;
  status: MonitorSignalStatus;
  score: number;
  description: string;
  nextAction: string;
};

export type MonitorIncident = {
  id: string;
  title: string;
  severity: MonitorSignalStatus;
  detail: string;
  recommendedFix: string;
};

export type ProjectMonitorReport = {
  projectId: string;
  title: string;
  summary: string;
  overallHealthScore: number;
  status: MonitorSignalStatus;
  riskLevel: MonitorRiskLevel;
  signals: MonitorSignal[];
  incidents: MonitorIncident[];
  nextActions: string[];
  generatedAt: string;
};