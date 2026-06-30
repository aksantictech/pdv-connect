import type { ReactNode } from "react";
import Card from "@/components/ui/cards/Card";

type DashboardWidgetProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function DashboardWidget({
  title,
  description,
  children,
  actions,
  className = "",
}: DashboardWidgetProps) {
  return (
    <Card className={className}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#092e63]">{title}</h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {children}
    </Card>
  );
}