import {
  Banknote,
  Building2,
  CreditCard,
  Heart,
  Smartphone,
} from "lucide-react";

const paymentOptions = [
  {
    title: "Mobile Money",
    description:
      "Paiement via les opérateurs Mobile Money utilisés par l’Église.",
    icon: Smartphone,
  },
  {
    title: "Carte bancaire",
    description:
      "Paiement sécurisé par Visa, Mastercard ou autres cartes compatibles.",
    icon: CreditCard,
  },
  {
    title: "PayPal",
    description:
      "Contribution en ligne depuis PayPal pour les membres à l’international.",
    icon: Heart,
  },
  {
    title: "Virement bancaire",
    description:
      "Don ou offrande par transfert sur le compte officiel de l’Église.",
    icon: Building2,
  },
];

export default function DonsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-[#082553] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
            <Banknote size={17} />
            Dons & Offrandes
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Soutenez l’œuvre de Dieu avec simplicité et sécurité.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            Cette page regroupera les dons, dîmes, offrandes et contributions
            destinées aux projets de CEF Parole de Vie.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-extrabold">Paiement sécurisé en préparation</p>
          <p className="mt-2 text-sm leading-6">
            Les paiements ne sont pas encore activés. Ils seront connectés
            uniquement après validation des comptes officiels, des devises et
            des prestataires autorisés par CEF Parole de Vie.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {paymentOptions.map((option) => {
            const Icon = option.icon;

            return (
              <article
                key={option.title}
                className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
                  <Icon size={24} />
                </div>

                <h2 className="mt-6 text-xl font-black text-[#092e63]">
                  {option.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {option.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}