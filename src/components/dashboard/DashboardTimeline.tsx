type TimelineItem = {
  time: string;
  title: string;
  description?: string;
};

type DashboardTimelineProps = {
  items: TimelineItem[];
};

export default function DashboardTimeline({ items }: DashboardTimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.time}-${item.title}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-[#0a3d82]">
              {index + 1}
            </span>

            {index < items.length - 1 && (
              <span className="mt-2 h-full w-px bg-blue-100" />
            )}
          </div>

          <div className="pb-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
              {item.time}
            </p>

            <p className="mt-1 font-extrabold text-[#092e63]">
              {item.title}
            </p>

            {item.description && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}