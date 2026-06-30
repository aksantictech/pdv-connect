import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0a3d82] text-white shadow-lg shadow-blue-900/15 hover:bg-[#072d61]",
  secondary:
    "bg-[#1680c4] text-white shadow-lg shadow-blue-900/10 hover:bg-[#0a6aa4]",
  outline:
    "border border-blue-100 bg-white text-[#0a3d82] hover:bg-blue-50",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-[#0a3d82]",
  danger:
    "bg-red-600 text-white shadow-lg shadow-red-900/10 hover:bg-red-700",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}