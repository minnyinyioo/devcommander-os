import {
  Brain,
  ShieldCheck,
  Route,
  RefreshCcw,
  BadgeCheck,
  Radar,
  Scale,
  WalletCards
} from "lucide-react";

export const modules = [
  {
    title: "Project Brain",
    description: "A permanent source of truth for product goals, rules, context and decisions.",
    icon: Brain,
    status: "ONLINE"
  },
  {
    title: "Change Protection",
    description: "Prevents AI agents from changing unrelated files or breaking existing work.",
    icon: ShieldCheck,
    status: "ACTIVE"
  },
  {
    title: "AI Router",
    description: "Routes planning, coding, review and research tasks to the right AI workflow.",
    icon: Route,
    status: "READY"
  },
  {
    title: "Recovery Engine",
    description: "Creates safe recovery plans when a project breaks, fails to build or loses direction.",
    icon: RefreshCcw,
    status: "STANDBY"
  },
  {
    title: "Verification Engine",
    description: "Stops false completion by requiring build, test and acceptance checks.",
    icon: BadgeCheck,
    status: "CHECKING"
  },
  {
    title: "Reality Engine",
    description: "Prevents hallucinated files, APIs, database tables and fake architecture.",
    icon: Radar,
    status: "SCANNING"
  },
  {
    title: "Scope Guardian",
    description: "Controls feature creep and keeps MVPs launchable.",
    icon: Scale,
    status: "LOCKED"
  },
  {
    title: "Cost Optimizer",
    description: "Reduces AI token waste and helps choose the right model for the right task.",
    icon: WalletCards,
    status: "OPTIMIZED"
  }
];
