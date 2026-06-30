import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        {eyebrow && (
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </section>
  );
}