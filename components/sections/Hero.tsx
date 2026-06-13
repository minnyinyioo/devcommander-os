import { ArrowRight, Building2, Briefcase, Cpu, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductMockup } from "@/components/ui/ProductMockup";
const trustItems = [{ label: "Non-Technical Founders", icon: Users }, { label: "Solo Builders", icon: Cpu }, { label: "Startup Teams", icon: Building2 }, { label: "Agencies", icon: Briefcase }];
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 py-24 text-white md:py-32">
      <div className="absolute inset-0 grid-bg animate-gridMove opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.18),transparent_30%)]" />
      <Container><div className="relative grid items-center gap-14 lg:grid-cols-2"><div><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"><span className="h-2 w-2 rounded-full bg-brandCyan" />AI Product Operating System</div><h1 className="text-4xl font-bold tracking-tight md:text-6xl">Build Real Products<br />With AI.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">DevCommander OS helps beginners and professionals turn ideas into handoff-ready, maintainable and launch-ready products while preventing AI development failure.</p><div className="mt-10 flex flex-col gap-4 sm:flex-row"><Button href="#pricing">Get Started</Button><Button href="#contact" variant="dark">Book a Demo</Button></div><div className="mt-8 flex items-center gap-2 font-mono text-sm text-slate-400"><span>runtime.status = ready_for_product_build</span><ArrowRight size={16} /></div><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{trustItems.map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-center gap-2 text-sm text-slate-300"><Icon size={18} className="text-brandCyan" /><span>{item.label}</span></div>; })}</div></div><ProductMockup /></div></Container>
    </section>
  );
}
