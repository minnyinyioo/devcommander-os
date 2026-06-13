import { ShieldCheck } from "lucide-react";
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white dark:bg-white dark:text-slate-950"><ShieldCheck size={22} strokeWidth={1.8} /></div>
      <div><p className="text-base font-bold leading-none text-primary dark:text-white">DevCommander OS</p><p className="mt-1 text-xs font-medium text-mutedText dark:text-slate-400">AI Product Operating System</p></div>
    </div>
  );
}
