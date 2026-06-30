import {
  Banknote,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Package,
  Users,
} from "lucide-react";

import MetricCard from "@/components/ui/cards/MetricCard";
import Section from "@/components/ui/layout/Section";
import { getDashboardData } from "@/services/dashboard";
import {
  DashboardGrid,
  DashboardHero,
  DashboardQuickActions,
  DashboardNotifications,
  DashboardTimeline,
  DashboardWidget,
} from "@/components/dashboard";

const timelineItems = [
  {
    time: "Aujourd’hui",
    title: "Nouveaux membres à contacter",
    description: "Les personnes inscrites récemment seront listées ici.",
  },
  {
    time: "Cette semaine",
    title: "Rapports à vérifier",
    description: "Suivi des départements, activités et responsables.",
  },
  {
    time: "À venir",
    title: "Finances et patrimoine",
    description: "Les alertes financières et maintenances apparaîtront ici.",
  },
];

export default async function AdminDashboardPage() {
  const dashboard = await getDashboardData();

  const metrics = [
    {
      title: "Membres",
      value: dashboard.stats.membersCount,
      description: "Effectif global enregistré.",
      icon: Users,
      tone: "blue" as const,
      href: "/admin/membres",
    },
    {
      title: "Nouveaux membres",
      value: dashboard.stats.newMembersCount,
      description: "Personnes à suivre et intégrer.",
      icon: HeartHandshake,
      tone: "green" as const,
      href: "/admin/nouveaux-membres",
    },
    {
      title: "Élèves",
      value: dashboard.stats.studentsCount,
      description: "Élèves inscrits dans les écoles.",
      icon: GraduationCap,
      tone: "violet" as const,
      href: "/admin/ecole/eleves",
    },
    {
      title: "Activités",
      value: dashboard.stats.activitiesCount,
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
          <div className="flex h-72 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 text-sm font-bold text-slate-500">
            Graphique en préparation
          </div>
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
          <DashboardNotifications />
        </DashboardWidget>

        <DashboardWidget
          title="Résumé stratégique"
          description="Finances, patrimoine et école."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {["Finances", "Patrimoine", "École"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-5 text-center"
              >
                <p className="text-2xl font-black text-[#092e63]">0</p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {item}
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