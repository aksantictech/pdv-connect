export type DashboardStats = {
  membersCount: number;
  newMembersCount: number;
  newMembersThisMonth: number;
  studentsCount: number;
  assembliesCount: number;
  activeAssembliesCount: number;
  departmentsCount: number;
  activeDepartmentsCount: number;
  activitiesCount: number;
  activitiesThisWeek: number;
};

export type DashboardActivity = {
  id: string;
  time: string;
  title: string;
  description?: string;
};

export type DashboardData = {
  stats: DashboardStats;
  activities: DashboardActivity[];
};