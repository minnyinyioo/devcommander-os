import { CircleHelp } from "lucide-react";
import { faqs } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
export function FAQ() {
  return <section id="faq" className="bg-softBg py-24 dark:bg-slate-900"><Container><SectionTitle eyebrow="FAQ" title="Common Questions" description="Clear answers for builders considering DevCommander OS." /><div className="mx-auto max-w-3xl space-y-4">{faqs.map((faq) => <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"><div className="flex gap-4"><CircleHelp className="shrink-0 text-brandBlue dark:text-brandCyan" size={24} /><div><h3 className="font-semibold text-primary dark:text-white">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-mutedText dark:text-slate-400">{faq.answer}</p></div></div></div>)}</div></Container></section>;
}
