export type DashboardStats = {
  membersCount: number;
  newMembersCount: number;
  newMembersThisMonth: number;

  studentsCount: number;
  teachersCount: number;
  schoolsCount: number;

  assembliesCount: number;
  activeAssembliesCount: number;

  departmentsCount: number;
  activeDepartmentsCount: number;

  pastorsCount: number;

  activitiesCount: number;
  activitiesThisWeek: number;

  publicRequestsCount: number;
  unreadPublicRequestsCount: number;
};

export type MembersGrowthPoint = {
  month: string;
  members: number;
};

export type DashboardActivity = {
  id: string;
  time: string;
  title: string;
  description?: string;
};

export type DashboardAlert = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "blue" | "green" | "orange" | "red" | "violet";
};

export type DashboardData = {
  stats: DashboardStats;
  membersGrowth: MembersGrowthPoint[];
  activities: DashboardActivity[];
  alerts: DashboardAlert[];
};