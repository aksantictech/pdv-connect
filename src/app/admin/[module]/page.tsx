import Link from "next/link";
import { ArrowRight, Construction, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

const modules: Record<
  string,
  {
    title: string;
    description: string;
    nextStep: string;
  }
> = {
  membres: {
    title: "Gestion des membres",
    description:
      "Ce module centralisera les dossiers des membres, leurs contacts, statuts, départements et parcours pastoral.",
    nextStep: "Créer la liste, la fiche membre et le formulaire d’ajout.",
  },
  "nouveaux-membres": {
    title: "Nouveaux membres",
    description:
      "Ce module permettra de suivre chaque inscription reçue depuis le formulaire public ou le QR Code.",
    nextStep: "Ajouter les actions de suivi, l’orientation et la conversion en membre actif.",
  },
  departements: {
    title: "Départements et ministères",
    description:
      "Ce module permettra de gérer les responsables, ouvriers, bénévoles et plans d’action.",
    nextStep: "Configurer responsables, membres et activités de chaque département.",
  },
  activites: {
    title: "Activités",
    description:
      "Ce module organisera les programmes hebdomadaires, mensuels et annuels des ministères.",
    nextStep: "Créer les formulaires de planification, validation et suivi.",
  },
  rapports: {
    title: "Rapports consolidés",
    description:
      "Ce module consolidera les résultats, activités et performances des départements.",
    nextStep: "Préparer les modèles de rapports automatiques et exports PDF/Excel.",
  },
  assemblees: {
    title: "Assemblées et implantations",
    description:
      "Ce module structurera la croissance de CEF Parole de Vie par pays, villes et assemblées locales.",
    nextStep: "Ajouter les extensions, responsables et vues consolidées.",
  },
  ecole: {
    title: "Administration scolaire",
    description:
      "Ce module couvrira les élèves, enseignants, inscriptions, présences, résultats et communications administratives.",
    nextStep: "Créer le schéma SQL détaillé et les écrans de gestion scolaire.",
  },
  dons: {
    title: "Dons et Offrandes",
    description:
      "Ce module centralisera les dons, dîmes, offrandes, campagnes et transactions sécurisées.",
    nextStep:
      "Configurer les comptes officiels et la passerelle Mobile Money, carte, PayPal et virement.",
  },
  parametres: {
    title: "Paramètres de PDV Connect",
    description:
      "Cet espace permettra de gérer les rôles, utilisateurs, préférences, assemblées et paramètres techniques.",
    nextStep: "Ajouter la gestion complète des utilisateurs et permissions.",
  },
};

type AdminModulePageProps = {
  params: Promise<{
    module: string;
  }>;
};

export default async function AdminModulePage({
  params,
}: AdminModulePageProps) {
  const { module } = await params;
  const currentModule = modules[module];

  if (!currentModule) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
          <Construction size={27} />
        </div>

        <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          Module en préparation
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
          {currentModule.title}
        </h1>

        <p className="mt-5 max-w-2xl leading-8 text-slate-600">
          {currentModule.description}
        </p>

        <div className="mt-8 flex gap-3 rounded-2xl bg-blue-50 p-5">
          <ShieldCheck size={21} className="shrink-0 text-[#0a56a4]" />
          <p className="text-sm leading-6 text-slate-700">
            <strong>Prochaine étape :</strong> {currentModule.nextStep}
          </p>
        </div>

        <Link
          href="/admin"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white transition hover:bg-[#072d61]"
        >
          Retour au tableau de bord
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}