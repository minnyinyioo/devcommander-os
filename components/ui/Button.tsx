import Link from "next/link";
type ButtonProps = { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "dark"; };
export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition";
  const styles = {
    primary: "bg-brandBlue text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700",
    secondary: "border border-slate-300 text-primary hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10",
    dark: "border border-white/20 text-white hover:bg-white/10"
  };
  return <Link href={href} className={`${base} ${styles[variant]}`}>{children}</Link>;
}
