import type { ReactNode } from "react";

type SectionProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Section({
  title,
  description,
  actions,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`mt-8 ${className}`}>
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            {title && (
              <h2 className="text-xl font-black text-[#092e63]">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      {children}
    </section>
  );
}