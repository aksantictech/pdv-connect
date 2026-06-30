import {
  Building2,
  ClipboardCheck,
  Package,
  Settings,
} from "lucide-react";

import PageHeader from "@/components/ui/layout/PageHeader";
import Section from "@/components/ui/layout/Section";
import MetricCard from "@/components/ui/cards/MetricCard";

const cards = [
  {
    title: "Biens enregistrés",
    value: "0",
    description: "Immobilier, équipements, mobilier et matériel.",
    icon: Package,
    tone: "blue" as const,
    href: "/admin/patrimoine/inventaire",
  },
  {
    title: "Immobilier",
    value: "0",
    description: "Temples, écoles, parcelles et bâtiments.",
    icon: Building2,
    tone: "green" as const,
    href: "/admin/patrimoine/immobilier",
  },
  {
    title: "Inventaires actifs",
    value: "0",
    description: "Contrôles et vérifications du patrimoine.",
    icon: ClipboardCheck,
    tone: "violet" as const,
    href: "/admin/patrimoine/inventaire",
  },
  {
    title: "Maintenances",
    value: "0",
    description: "Interventions prévues ou en cours.",
    icon: Settings,
    tone: "orange" as const,
    href: "/admin/patrimoine/maintenance",
  },
];

export default function AssetsDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Patrimoine"
        title="Tableau de bord patrimoine"
        description="Ce module permettra de gérer les bâtiments, équipements, véhicules, mobiliers, documents, affectations, inventaires et maintenances de l’Église."
      />

      <Section>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>
      </Section>
    </div>
  );
}