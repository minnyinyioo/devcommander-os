export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string; }) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-brandBlue dark:text-brandCyan">{eyebrow}</p>}
      <h2 className="text-3xl font-bold tracking-tight text-primary dark:text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-8 text-mutedText dark:text-slate-400">{description}</p>}
    </div>
  );
}
