export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export type WorkspaceRecord = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: WorkspaceRole;
  createdAt?: string;
};

export type WorkspaceActionResult<T = undefined> = {
  ok: boolean;
  data?: T;
  error?: string;
};