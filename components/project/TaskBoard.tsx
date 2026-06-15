"use client";

import { useMemo, useState } from "react";
import {
  copyToClipboard,
  downloadTextFile,
  RuntimeSection,
  sectionToText,
} from "@/lib/project/project-runtime";

type UnknownRecord = Record<string, unknown>;

type TaskPriority = "P0" | "P1" | "P2" | "Unknown";

type NormalizedTask = {
  id: string;
  phase: string;
  title: string;
  priority: TaskPriority;
  owner: string;
  description: string;
  sourceArchitectureRefs: string[];
  acceptanceCriteria: string[];
};

type ParsedTaskPlan = {
  documentType?: string;
  version?: string;
  generatedAt?: string;
  projectName?: string;
  executionPrinciple?: string;
  phaseOrder: string[];
  qualityGates: string[];
  tasks: NormalizedTask[];
};

type TaskBoardProps = {
  section: RuntimeSection;
};

type PriorityFilter = "all" | TaskPriority;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: UnknownRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function readStringArray(record: UnknownRecord, keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function parseJsonString(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function normalizePriority(value: unknown): TaskPriority {
  if (value === "P0" || value === "P1" || value === "P2") return value;

  return "Unknown";
}

function normalizeTask(value: unknown, index: number): NormalizedTask | null {
  if (typeof value === "string") {
    const title = value.trim();

    if (!title) return null;

    return {
      id: `TASK-${String(index + 1).padStart(3, "0")}`,
      phase: "General",
      title,
      priority: "Unknown",
      owner: "Unassigned",
      description: title,
      sourceArchitectureRefs: [],
      acceptanceCriteria: [],
    };
  }

  if (!isRecord(value)) return null;

  const title = readString(value, ["title", "name", "task"], `Task ${index + 1}`);

  return {
    id: readString(value, ["id", "taskId"], `TASK-${String(index + 1).padStart(3, "0")}`),
    phase: readString(value, ["phase", "stage", "group"], "General"),
    title,
    priority: normalizePriority(value.priority),
    owner: readString(value, ["owner", "assignee", "team"], "Unassigned"),
    description: readString(value, ["description", "details", "summary"], title),
    sourceArchitectureRefs: readStringArray(value, [
      "sourceArchitectureRefs",
      "sourceRefs",
      "refs",
      "architectureRefs",
    ]),
    acceptanceCriteria: readStringArray(value, [
      "acceptanceCriteria",
      "acceptance_criteria",
      "criteria",
      "checks",
    ]),
  };
}

function parseTaskPlan(section: RuntimeSection): ParsedTaskPlan {
  const parsedSection = typeof section === "string" ? parseJsonString(section) : section;

  if (Array.isArray(parsedSection)) {
    return {
      phaseOrder: [],
      qualityGates: [],
      tasks: parsedSection
        .map((item, index) => normalizeTask(item, index))
        .filter((item): item is NormalizedTask => Boolean(item)),
    };
  }

  if (isRecord(parsedSection)) {
    const rawTasks = Array.isArray(parsedSection.tasks)
      ? parsedSection.tasks
      : Array.isArray(parsedSection.items)
        ? parsedSection.items
        : [];

    return {
      documentType: readString(parsedSection, ["documentType"]),
      version: readString(parsedSection, ["version"]),
      generatedAt: readString(parsedSection, ["generatedAt"]),
      projectName: readString(parsedSection, ["projectName", "productName"]),
      executionPrinciple: readString(parsedSection, ["executionPrinciple"]),
      phaseOrder: readStringArray(parsedSection, ["phaseOrder"]),
      qualityGates: readStringArray(parsedSection, ["qualityGates"]),
      tasks: rawTasks
        .map((item, index) => normalizeTask(item, index))
        .filter((item): item is NormalizedTask => Boolean(item)),
    };
  }

  const fallbackText = sectionToText(section);

  if (!fallbackText.trim()) {
    return {
      phaseOrder: [],
      qualityGates: [],
      tasks: [],
    };
  }

  return {
    phaseOrder: [],
    qualityGates: [],
    tasks: [
      {
        id: "TASK-001",
        phase: "General",
        title: "Generated Task Output",
        priority: "Unknown",
        owner: "Unassigned",
        description: fallbackText,
        sourceArchitectureRefs: [],
        acceptanceCriteria: [],
      },
    ],
  };
}

function formatTaskMarkdown(task: NormalizedTask): string {
  const criteria =
    task.acceptanceCriteria.length > 0
      ? task.acceptanceCriteria.map((item) => `- [ ] ${item}`).join("\n")
      : "- [ ] No acceptance criteria provided.";

  const refs =
    task.sourceArchitectureRefs.length > 0
      ? task.sourceArchitectureRefs.map((item) => `- ${item}`).join("\n")
      : "- No architecture refs provided.";

  return `## ${task.id} — ${task.title}

Phase: ${task.phase}
Priority: ${task.priority}
Owner: ${task.owner}

### Description

${task.description}

### Acceptance Criteria

${criteria}

### Source Architecture References

${refs}
`;
}

function buildTaskPlanMarkdown(plan: ParsedTaskPlan, tasks: NormalizedTask[]): string {
  const qualityGates =
    plan.qualityGates.length > 0
      ? plan.qualityGates.map((item) => `- ${item}`).join("\n")
      : "- No quality gates provided.";

  const taskMarkdown = tasks.map(formatTaskMarkdown).join("\n---\n\n");

  return `# ${plan.projectName || "DevCommander OS"} — Engineering Task Plan

Document Type: ${plan.documentType || "Engineering Task Plan"}
Version: ${plan.version || "2.0"}
Generated At: ${plan.generatedAt || "N/A"}

## Execution Principle

${plan.executionPrinciple || "PRD → Architecture → Tasks → Code → Test → Deploy → Monitor"}

## Quality Gates

${qualityGates}

---

${taskMarkdown}
`;
}

function getPriorityClass(priority: TaskPriority): string {
  if (priority === "P0") {
    return "bg-red-500/10 text-red-300 ring-red-400/20";
  }

  if (priority === "P1") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  if (priority === "P2") {
    return "bg-sky-500/10 text-sky-300 ring-sky-400/20";
  }

  return "bg-zinc-800 text-zinc-400 ring-white/10";
}

function groupTasksByPhase(tasks: NormalizedTask[], phaseOrder: string[]) {
  const map = new Map<string, NormalizedTask[]>();

  for (const task of tasks) {
    const current = map.get(task.phase) ?? [];
    current.push(task);
    map.set(task.phase, current);
  }

  const orderedPhases = [
    ...phaseOrder.filter((phase) => map.has(phase)),
    ...Array.from(map.keys()).filter((phase) => !phaseOrder.includes(phase)),
  ];

  return orderedPhases.map((phase) => ({
    phase,
    tasks: map.get(phase) ?? [],
  }));
}

function TaskCard({ task }: { task: NormalizedTask }) {
  const [expanded, setExpanded] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopyTask() {
    const copied = await copyToClipboard(formatTaskMarkdown(task));

    setCopyState(copied ? "copied" : "failed");

    window.setTimeout(() => {
      setCopyState("idle");
    }, 1600);
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:border-white/20 hover:bg-white/[0.04]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/[0.06] px-3 py-1 font-mono text-xs text-zinc-400 ring-1 ring-white/10">
              {task.id}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityClass(
                task.priority,
              )}`}
            >
              {task.priority}
            </span>

            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
              {task.owner}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold leading-7 text-white">{task.title}</h3>

          <p className="mt-3 text-sm leading-7 text-zinc-400">{task.description}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            {expanded ? "Hide Criteria" : "Show Criteria"}
          </button>

          <button
            type="button"
            onClick={handleCopyTask}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Failed" : "Copy Task"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
            <p className="text-sm font-semibold text-white">Acceptance Criteria</p>

            {task.acceptanceCriteria.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
                {task.acceptanceCriteria.map((item, index) => (
                  <li key={`${task.id}-criteria-${index}`} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">No acceptance criteria provided.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
            <p className="text-sm font-semibold text-white">Architecture References</p>

            {task.sourceArchitectureRefs.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
                {task.sourceArchitectureRefs.map((item, index) => (
                  <li key={`${task.id}-ref-${index}`} className="font-mono text-xs">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">No architecture references provided.</p>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function TaskBoard({ section }: TaskBoardProps) {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const plan = useMemo(() => parseTaskPlan(section), [section]);

  const owners = useMemo(() => {
    return Array.from(new Set(plan.tasks.map((task) => task.owner))).sort();
  }, [plan.tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return plan.tasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          task.id,
          task.phase,
          task.title,
          task.priority,
          task.owner,
          task.description,
          ...task.acceptanceCriteria,
          ...task.sourceArchitectureRefs,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      const matchesOwner = ownerFilter === "all" || task.owner === ownerFilter;

      return matchesQuery && matchesPriority && matchesOwner;
    });
  }, [ownerFilter, plan.tasks, priorityFilter, query]);

  const groupedTasks = useMemo(() => {
    return groupTasksByPhase(filteredTasks, plan.phaseOrder);
  }, [filteredTasks, plan.phaseOrder]);

  const priorityCounts = useMemo(() => {
    return {
      P0: plan.tasks.filter((task) => task.priority === "P0").length,
      P1: plan.tasks.filter((task) => task.priority === "P1").length,
      P2: plan.tasks.filter((task) => task.priority === "P2").length,
      Unknown: plan.tasks.filter((task) => task.priority === "Unknown").length,
    };
  }, [plan.tasks]);

  async function handleCopyAllTasks() {
    const copied = await copyToClipboard(buildTaskPlanMarkdown(plan, filteredTasks));

    setCopyState(copied ? "copied" : "failed");

    window.setTimeout(() => {
      setCopyState("idle");
    }, 1600);
  }

  function handleDownloadTasks() {
    downloadTextFile(
      "devcommander-engineering-tasks.md",
      buildTaskPlanMarkdown(plan, filteredTasks),
    );
  }

  if (plan.tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/50 p-8 text-center">
        <p className="text-sm font-medium text-zinc-300">Tasks are not generated yet.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Task Generator V2 UI is ready. Generate a new project to view structured tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Engineering Task Board
          </p>

          <h2 className="mt-3 text-2xl font-semibold text-white">
            {plan.projectName || "Task Generator V2"}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
            {plan.executionPrinciple ||
              "Every task must preserve PRD → Architecture → Code → Test → Deploy → Monitor continuity."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopyAllTasks}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Failed" : "Copy All"}
          </button>

          <button
            type="button"
            onClick={handleDownloadTasks}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            Download Tasks
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">Total Tasks</p>
          <p className="mt-2 text-2xl font-semibold text-white">{plan.tasks.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">P0 Critical</p>
          <p className="mt-2 text-2xl font-semibold text-red-300">{priorityCounts.P0}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">P1 Important</p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">{priorityCounts.P1}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">Owners</p>
          <p className="mt-2 text-2xl font-semibold text-white">{owners.length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks, owners, phases, criteria..."
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
        />

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
        >
          <option value="all">All Priorities</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="Unknown">Unknown</option>
        </select>

        <select
          value={ownerFilter}
          onChange={(event) => setOwnerFilter(event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
        >
          <option value="all">All Owners</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>

      {plan.qualityGates.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">Quality Gates</p>

          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {plan.qualityGates.map((gate, index) => (
              <div key={`quality-gate-${index}`} className="flex gap-2 text-sm leading-6 text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span>{gate}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {groupedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm text-zinc-400">No tasks match the current filters.</p>
          </div>
        ) : (
          groupedTasks.map((group) => (
            <section key={group.phase}>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{group.phase}</h3>
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-zinc-400 ring-1 ring-white/10">
                  {group.tasks.length} task{group.tasks.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {group.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}