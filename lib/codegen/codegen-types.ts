export type CodePackFile = {
  path: string;
  language: string;
  description: string;
  content: string;
};

export type CodePack = {
  projectId: string;
  title: string;
  summary: string;
  fileCount: number;
  generatedAt: string;
  files: CodePackFile[];
  nextSteps: string[];
};