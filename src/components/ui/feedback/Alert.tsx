import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";

type AlertTone = "info" | "success" | "warning" | "danger";

type AlertProps = {
  title?: string;
  children: ReactNode;
  tone?: AlertTone;
};

const config = {
  info: {
    icon: Info,
    className: "border-blue-100 bg-blue-50 text-[#0a3d82]",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-100 bg-emerald-50 text-emerald-800",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-100 bg-amber-50 text-amber-800",
  },
  danger: {
    icon: XCircle,
    className: "border-red-100 bg-red-50 text-red-800",
  },
};

export default function Alert({
  title,
  children,
  tone = "info",
}: AlertProps) {
  const Icon = config[tone].icon;

  return (
    <div
      className={`flex gap-3 rounded-2xl border px-4 py-3 text-sm ${config[tone].className}`}
    >
      <Icon size={19} className="mt-0.5 shrink-0" />

      <div>
        {title && <p className="font-black">{title}</p>}
        <div className={title ? "mt-1 leading-6" : "leading-6"}>
          {children}
        </div>
      </div>
    </div>
  );
}