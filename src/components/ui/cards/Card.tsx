import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <article
      className={`rounded-3xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-950/5 ${className}`}
    >
      {children}
    </article>
  );
}