import { ArrowRight, Building2, Briefcase, Cpu, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductMockup } from "@/components/ui/ProductMockup";

const trustItems = [
  { label: "Founders", icon: Users },
  { label: "Builders", icon: Cpu },
  { label: "Startups", icon: Building2 },
  { label: "Agencies", icon: Briefcase }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.16),transparent_38%)]" />

      <Container>
        <div className="relative flex min-h-[calc(100vh-82px)] flex-col items-center py-20 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-brandCyan" />
              AI Product Operating System
            </div>

            <h1 className="text-5xl font-bold leading-[1.03] tracking-tight md:text-7xl">
              Build Real Products
              <br />
              With AI.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              DevCommander OS helps beginners and professionals turn one idea into
              a handoff-ready, maintainable and launch-ready product system.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/dashboard">Get Started</Button>
              <Button href="#contact" variant="dark">
                Book a Demo
              </Button>
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 font-mono text-xs text-slate-400 md:text-sm">
              <span>runtime.status = ready_for_product_build</span>
              <ArrowRight size={15} strokeWidth={1.8} />
            </div>

            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-center gap-2 text-xs text-slate-300 md:text-sm"
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                      className="text-brandCyan"
                    />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 w-full max-w-5xl">
            <ProductMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}