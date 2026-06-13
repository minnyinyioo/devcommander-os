import { AlertTriangle, FileWarning, RefreshCcw, Clock, Layers, BrainCircuit } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
const problems = [{ title: "AI loses context", icon: BrainCircuit }, { title: "Token waste grows fast", icon: Clock }, { title: "AI edits wrong files", icon: FileWarning }, { title: "Projects break suddenly", icon: AlertTriangle }, { title: "Scope keeps expanding", icon: Layers }, { title: "No reliable verification", icon: RefreshCcw }];
export function Problem() {
  return <section id="problem" className="bg-softBg py-24 dark:bg-slate-900"><Container><SectionTitle eyebrow="The Real Problem" title="AI Can Generate. But Projects Still Fail." description="Most AI tools generate outputs. DevCommander OS focuses on preventing failure during the entire product development process." /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{problems.map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"><Icon className="mb-5 text-brandBlue dark:text-brandCyan" size={26} /><h3 className="text-lg font-semibold text-primary dark:text-white">{item.title}</h3></div>; })}</div></Container></section>;
}
