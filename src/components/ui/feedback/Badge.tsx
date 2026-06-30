type BadgeTone =
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "violet"
  | "slate";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const tones: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-[#0a3d82] border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  orange: "bg-amber-50 text-amber-700 border-amber-100",
  red: "bg-red-50 text-red-700 border-red-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
  slate: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function Badge({
  children,
  tone = "blue",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-black ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}