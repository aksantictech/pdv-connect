import { Banknote, BarChart3, FileText, Wallet } from "lucide-react";
import PageHeader from "@/components/ui/layout/PageHeader";
import MetricCard from "@/components/ui/cards/MetricCard";

const cards = [
  {
    title: "Recettes du mois",
    value: "0",
    description: "Dîmes, offrandes, dons et autres entrées.",
    icon: Banknote,
  },
  {
    title: "Dépenses du mois",
    value: "0",
    description: "Dépenses validées et enregistrées.",
    icon: FileText,
  },
  {
    title: "Solde estimé",
    value: "0",
    description: "Vue consolidée des caisses.",
    icon: Wallet,
  },
  {
    title: "Budgets suivis",
    value: "0",
    description: "Budgets actifs par assemblée ou département.",
    icon: BarChart3,
  },
];

export default function FinanceDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Finances"
        title="Tableau de bord financier"
        description="Ce module centralisera les dîmes, offrandes, dons, dépenses, budgets, caisses et rapports financiers de CEF Parole de Vie."
      />

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} href="/admin/finances/rapports" />
        ))}
      </section>
    </div>
  );
}