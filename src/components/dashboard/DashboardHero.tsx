type DashboardHeroProps = {
  fullName?: string;
  roleLabel?: string;
  organizationName?: string;
};

function getFirstName(fullName?: string) {
  if (!fullName) return "Utilisateur";
  return fullName.trim().split(/\s+/)[0] || "Utilisateur";
}

export default function DashboardHero({
  fullName,
  roleLabel = "Administrateur",
  organizationName = "CEF Parole de Vie",
}: DashboardHeroProps) {
  const firstName = getFirstName(fullName);

  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] p-8 text-white shadow-2xl shadow-blue-950/20">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">
          PDV Connect Enterprise
        </p>

        <h1 className="mt-4 text-3xl font-black sm:text-4xl">
          Bonjour {firstName} 👋
        </h1>

        <p className="mt-3 text-sm font-semibold text-blue-100">
          {roleLabel}
        </p>

        <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50">
          Bienvenue dans le centre de pilotage de {organizationName}. Suivez la
          croissance, l’organisation, l’école, les finances et le patrimoine
          depuis un seul espace.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Nouveaux membres",
            "Demandes publiques",
            "Activités",
            "Rapports",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}