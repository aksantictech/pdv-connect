import {
  Banknote,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Package,
  Users,
  
} from "lucide-react";

import MembersGrowthChart from "@/components/dashboard/charts/MembersGrowthChart";
import {
  DashboardGrid,
  DashboardHero,
  DashboardNotifications,
  DashboardQuickActions,
  DashboardTimeline,
  DashboardWidget,
  DashboardRecentActivity,
} from "@/components/dashboard";
import MetricCard from "@/components/ui/cards/MetricCard";
import Section from "@/components/ui/layout/Section";
import { getDashboardData } from "@/services/dashboard";

export default async function AdminDashboardPage() {
  const dashboard = await getDashboardData();

  const timelineItems = dashboard.alerts.map((alert) => ({
    time: "À suivre",
    title: alert.title,
    description: alert.description,
  }));

  const metrics = [
    {
      title: "Membres",
      value: dashboard.stats.membersCount,
      subtitle: `+${dashboard.stats.newMembersThisMonth} ce mois`,
      description: "Effectif global enregistré.",
      icon: Users,
      tone: "blue" as const,
      href: "/admin/membres",
    },
    {
      title: "Nouveaux membres",
      value: dashboard.stats.newMembersCount,
      subtitle: `${dashboard.stats.newMembersThisMonth} ce mois`,
      description: "Personnes à suivre et intégrer.",
      icon: HeartHandshake,
      tone: "green" as const,
      href: "/admin/nouveaux-membres",
    },
    {
      title: "Élèves",
      value: dashboard.stats.studentsCount,
      badge: `${dashboard.stats.schoolsCount} écoles`,
      description: "Élèves inscrits.",
      icon: GraduationCap,
      tone: "violet" as const,
      href: "/admin/ecole",
    },
    {
      title: "Activités",
      value: dashboard.stats.activitiesCount,
      subtitle: `${dashboard.stats.activitiesThisWeek} cette semaine`,
      description: "Activités programmées.",
      icon: CalendarDays,
      tone: "orange" as const,
      href: "/admin/activites",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <DashboardHero
        fullName="Tite"
        roleLabel="Administrateur général"
        organizationName="CEF Parole de Vie"
      />

      <Section title="Vue générale">
        <DashboardGrid>
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </DashboardGrid>
      </Section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardWidget
          title="Croissance du ministère"
          description="Évolution des membres, présences, assemblées et activités."
        >
          <MembersGrowthChart data={dashboard.membersGrowth} />
        </DashboardWidget>

        <DashboardWidget
          title="Centre ministériel"
          description="Actions prioritaires à suivre."
        >
          <DashboardTimeline items={timelineItems} />
        </DashboardWidget>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardWidget
          title="Actions rapides"
          description="Créer rapidement les éléments les plus utilisés."
        >
          <DashboardQuickActions />
        </DashboardWidget>

        <DashboardWidget
          title="Calendrier"
          description="Les événements et programmes à venir seront affichés ici."
        >
          <div className="flex h-64 items-center justify-center rounded-3xl bg-slate-50 text-sm font-bold text-slate-500">
            Calendrier en préparation
          </div>
        </DashboardWidget>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardWidget
          title="Notifications intelligentes"
          description="Alertes importantes à surveiller."
        >
          <DashboardNotifications alerts={dashboard.alerts} />
          <DashboardWidget
  title="Dernières activités"
  description="Résumé automatique des mouvements récents."
>
  <DashboardRecentActivity activities={dashboard.activities} />
</DashboardWidget>
        </DashboardWidget>

        <DashboardWidget
          title="Résumé stratégique"
          description="Finances, patrimoine et école."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Finances", value: 0 },
              { label: "Patrimoine", value: 0 },
              { label: "École", value: dashboard.stats.studentsCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-5 text-center"
              >
                <p className="text-2xl font-black text-[#092e63]">
                  {item.value}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </section>

      <Section title="Modules stratégiques">
        <DashboardGrid className="xl:grid-cols-3">
          <MetricCard
            title="Finances"
            value="0"
            description="Recettes, dépenses, budgets et rapports."
            icon={Banknote}
            tone="green"
            href="/admin/finances"
          />

          <MetricCard
            title="Patrimoine"
            value="0"
            description="Inventaire, immobilier, équipements et maintenance."
            icon={Package}
            tone="violet"
            href="/admin/patrimoine"
          />

          <MetricCard
            title="Vie de l’Église"
            value={dashboard.stats.activitiesCount}
            description="Activités, rapports et accompagnement."
            icon={HeartHandshake}
            tone="orange"
            href="/admin/activites"
          />
        </DashboardGrid>
      </Section>
    </div>
  );
}