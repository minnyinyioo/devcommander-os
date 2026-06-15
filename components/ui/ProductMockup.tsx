import { CheckCircle2, Brain, FileText, Network, ListChecks, ShieldCheck, PackageCheck } from "lucide-react";
import { RuntimeTerminal } from "@/components/ui/RuntimeTerminal";
const items = [
  { title: "Project Brain", status: "Completed", icon: Brain },
  { title: "PRD Generated", status: "Completed", icon: FileText },
  { title: "Architecture Designed", status: "Completed", icon: Network },
  { title: "Tasks Created", status: "Completed", icon: ListChecks },
  { title: "Change Protection", status: "Active", icon: ShieldCheck },
  { title: "Export Pack", status: "Ready", icon: PackageCheck }
];
const stats = [{ value: "14", label: "Engines" }, { value: "8", label: "Departments" }, { value: "1", label: "Project Brain" }];
export function ProductMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-brandBlue/20 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur md:p-5">
        <div className="mb-5 grid grid-cols-3 gap-3">{stats.map((s) => <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center"><p className="text-2xl font-bold text-white">{s.value}</p><p className="mt-1 text-xs text-slate-400">{s.label}</p></div>)}</div>
        <div className="mb-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-semibold text-white">DevCommander Runtime</p><p className="mt-1 text-xs text-slate-400">From idea to handoff-ready product</p></div><div className="rounded-full bg-brandCyan/10 px-3 py-1 text-xs font-semibold text-brandCyan">Product OS</div></div>
          <div className="space-y-3">{items.map((item) => { const Icon = item.icon; return <div key={item.title} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"><div className="flex items-center gap-3"><Icon size={18} strokeWidth={1.8} className="text-brandCyan" /><span className="text-sm text-slate-200">{item.title}</span></div><div className="flex items-center gap-2"><CheckCircle2 size={16} strokeWidth={1.8} className="text-brandCyan" /><span className="text-xs text-brandCyan">{item.status}</span></div></div>; })}</div>
        </div>
        <RuntimeTerminal />
      </div>
    </div>
  );
}

