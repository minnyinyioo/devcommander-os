import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
const roadmap = ["V1 Landing", "V2 Runtime MVP", "V3 Team Workspace", "V4 Marketplace", "V5 Enterprise OS"];
export function Roadmap() {
  return <section className="bg-white py-24 dark:bg-slate-950"><Container><SectionTitle eyebrow="Roadmap" title="From Landing Page to Product Operating System" description="A staged roadmap from early validation to enterprise platform." /><div className="grid gap-4 md:grid-cols-5">{roadmap.map((r, i) => <div key={r} className="rounded-2xl border border-slate-200 bg-softBg p-5 dark:border-white/10 dark:bg-white/[0.03]"><p className="font-mono text-sm text-brandBlue dark:text-brandCyan">0{i + 1}</p><h3 className="mt-2 font-semibold text-primary dark:text-white">{r}</h3></div>)}</div></Container></section>;
}
