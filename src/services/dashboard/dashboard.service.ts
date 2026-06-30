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

export async function getDashboardData(): Promise<DashboardData> {
  const monthStart = getMonthStartIso();
  const weekStart = getWeekStartIso();

  const [
    membersCount,
    newMembersCount,
    newMembersThisMonth,
    studentsCount,
    assembliesCount,
    activeAssembliesCount,
    departmentsCount,
    activeDepartmentsCount,
    activitiesCount,
    activitiesThisWeek,
  ] = await Promise.all([
    safeCount("members"),
    safeCount("new_member_registrations"),
    safeCount("new_member_registrations", (query) =>
      query.gte("created_at", monthStart)
    ),
    safeCount("students"),
    safeCount("assemblies"),
    safeCount("assemblies", (query) => query.eq("is_active", true)),
    safeCount("departments"),
    safeCount("departments", (query) => query.eq("is_active", true)),
    safeCount("activities"),
    safeCount("activities", (query) => query.gte("start_date", weekStart)),
  ]);

  return {
    stats: {
      membersCount,
      newMembersCount,
      newMembersThisMonth,
      studentsCount,
      assembliesCount,
      activeAssembliesCount,
      departmentsCount,
      activeDepartmentsCount,
      activitiesCount,
      activitiesThisWeek,
    },
    activities: [],
  };
}