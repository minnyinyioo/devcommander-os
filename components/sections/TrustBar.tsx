import { Building2, Briefcase, Cpu, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
const items = [{ label: "Founders", icon: Users }, { label: "Developers", icon: Cpu }, { label: "Startups", icon: Building2 }, { label: "Agencies", icon: Briefcase }];
export function TrustBar() {
  return <section className="border-y border-slate-200 bg-white py-8 dark:border-white/10 dark:bg-slate-950"><Container><div className="grid gap-6 md:grid-cols-5 md:items-center"><p className="text-sm font-semibold uppercase tracking-wide text-mutedText dark:text-slate-400">Built For</p><div className="grid gap-4 md:col-span-4 md:grid-cols-4">{items.map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-softBg px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"><Icon size={20} className="text-brandBlue dark:text-brandCyan" /><span className="text-sm font-medium text-primary dark:text-white">{item.label}</span></div>; })}</div></div></Container></section>;
}
