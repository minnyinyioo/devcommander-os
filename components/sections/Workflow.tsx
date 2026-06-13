import { workflowSteps } from "@/data/workflow";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Route } from "lucide-react";
export function Workflow() {
  return <section id="workflow" className="bg-softBg py-24 dark:bg-slate-900"><Container><SectionTitle eyebrow="Workflow" title="From Idea to Exportable Product Pack" description="A clear workflow that can be continued by any AI tool or human developer." /><div className="grid gap-4 md:grid-cols-4">{workflowSteps.map((s, i) => <div key={s} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]"><Route className="mx-auto mb-4 text-brandCyan" size={24} /><p className="font-mono text-sm text-mutedText dark:text-slate-500">Step {i + 1}</p><h3 className="mt-1 font-semibold text-primary dark:text-white">{s}</h3></div>)}</div></Container></section>;
}
