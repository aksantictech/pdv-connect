import { createClient } from "@/lib/supabase/server";
import type { DashboardData } from "./dashboard.types";

async function safeCount(
  tableName: string,
  filter?: (query: any) => any
): Promise<number> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from(tableName)
      .select("id", { count: "exact", head: true });

    if (filter) {
      query = filter(query);
    }

    const { count, error } = await query;

    if (error) {
      console.warn(`Dashboard count error on ${tableName}:`, error.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.warn(`Dashboard count failed on ${tableName}:`, error);
    return 0;
  }
}

function getMonthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getWeekStartIso() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}
async function getMembersGrowth() {
  const supabase = await createClient();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const { data, error } = await supabase
    .from("members")
    .select("created_at")
    .gte("created_at", start.toISOString());

  if (error || !data) {
    return [];
  }

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: new Intl.DateTimeFormat("fr-FR", {
        month: "short",
      }).format(date),
      members: 0,
    };
  });

  data.forEach((member) => {
    if (!member.created_at) return;

    const date = new Date(member.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = months.find((item) => item.key === key);

    if (month) {
      month.members += 1;
    }
  });

  return months.map(({ month, members }) => ({
    month,
    members,
  }));
}
function buildDashboardAlerts(stats: DashboardData["stats"]): DashboardData["alerts"] {
  return [
    {
      id: "new-members",
      title: "Nouveaux membres",
      description: `${stats.newMembersCount} inscription(s) à suivre.`,
      href: "/admin/nouveaux-membres",
      tone: "blue",
    },
    {
      id: "public-requests",
      title: "Demandes publiques",
      description: `${stats.unreadPublicRequestsCount} demande(s) non lue(s).`,
      href: "/admin/demandes",
      tone: stats.unreadPublicRequestsCount > 0 ? "red" : "green",
    },
    {
      id: "activities-week",
      title: "Activités cette semaine",
      description: `${stats.activitiesThisWeek} activité(s) planifiée(s).`,
      href: "/admin/activites",
      tone: "orange",
    },
    {
      id: "organization",
      title: "Organisation",
      description: `${stats.activeAssembliesCount} assemblée(s) active(s), ${stats.activeDepartmentsCount} département(s).`,
      href: "/admin/assemblees",
      tone: "violet",
    },
  ];
}
export async function getDashboardData(): Promise<DashboardData> {
  const monthStart = getMonthStartIso();
  const weekStart = getWeekStartIso();
  const membersGrowth = await getMembersGrowth();

  const [
    membersCount,
    newMembersCount,
    newMembersThisMonth,

    studentsCount,
    teachersCount,
    schoolsCount,

    assembliesCount,
    activeAssembliesCount,

    departmentsCount,
    activeDepartmentsCount,

    pastorsCount,

    activitiesCount,
    activitiesThisWeek,

    publicRequestsCount,
    unreadPublicRequestsCount,
  ] = await Promise.all([
    safeCount("members"),
    safeCount("new_member_registrations"),
    safeCount("new_member_registrations", (query) =>
      query.gte("created_at", monthStart)
    ),

    safeCount("students"),
    safeCount("teachers"),
    safeCount("schools"),

    safeCount("assemblies"),
    safeCount("assemblies", (query) => query.eq("is_active", true)),

    safeCount("departments"),
    safeCount("departments", (query) => query.eq("is_active", true)),

    safeCount("pastors"),

    safeCount("activity_plans"),
safeCount("activity_plans", (query) => query.gte("created_at", weekStart)),

    safeCount("pdv_public_requests"),
    safeCount("pdv_public_request_alerts", (query) =>
      query.eq("is_read", false)
    ),
  ]);

  const stats = {
  membersCount,
  newMembersCount,
  newMembersThisMonth,

  studentsCount,
  teachersCount,
  schoolsCount,

  assembliesCount,
  activeAssembliesCount,

  departmentsCount,
  activeDepartmentsCount,

  pastorsCount,

  activitiesCount,
  activitiesThisWeek,

  publicRequestsCount,
  unreadPublicRequestsCount,
};

return {
  stats,
  activities: [
  {
    id: "members",
    time: "Aujourd’hui",
    title: "Membres enregistrés",
    description: `${membersCount} membre(s) dans la base.`,
  },
  {
    id: "new-members",
    time: "Ce mois",
    title: "Nouveaux membres",
    description: `${newMembersThisMonth} nouvelle(s) inscription(s).`,
  },
  {
    id: "activities",
    time: "Cette semaine",
    title: "Activités",
    description: `${activitiesThisWeek} activité(s) planifiée(s).`,
  },
],
  membersGrowth,
  alerts: buildDashboardAlerts(stats),
};
}

