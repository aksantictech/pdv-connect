import type { ReactNode } from "react";

type DashboardGridProps = {
  children: ReactNode;
  className?: string;
};

export default function DashboardGrid({
  children,
  className = "",
}: DashboardGridProps) {
  return (
    <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
}