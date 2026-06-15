import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a href="#problem">Problem</a>
          <a href="#modules">Modules</a>
          <a href="#workflow">Workflow</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          <Button href="/dashboard">
            Open Runtime
          </Button>

          <Button href="#contact">
            Book Demo
          </Button>
        </div>

        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}