import type { DashboardActivity } from "@/services/dashboard";

type DashboardRecentActivityProps = {
  activities: DashboardActivity[];
};

export default function DashboardRecentActivity({
  activities,
}: DashboardRecentActivityProps) {
  if (!activities.length) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-5 text-sm font-bold text-slate-500">
        Aucune activité récente pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
            {activity.time}
          </p>

          <p className="mt-1 font-extrabold text-[#092e63]">
            {activity.title}
          </p>

          {activity.description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {activity.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}