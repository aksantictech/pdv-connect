import Link from "next/link";
import type { ReactNode } from "react";
import {
ArrowRight,
Banknote,
Building2,
CheckCircle2,
CreditCard,
Heart,
Mail,
ShieldCheck,
Smartphone,
type LucideIcon,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type DonationBlock = {
block_key: string;
title: string | null;
subtitle: string | null;
content: string | null;
primary_label: string | null;
primary_href: string | null;
secondary_label: string | null;
secondary_href: string | null;
};

const blockKeys = [
"donations_hero",
"donations_message",
"donations_mobile_money",
"donations_card",
"donations_paypal",
"donations_bank",
"donations_online",
"donations_transparency",
"donations_contact",
];

const fallbackBlocks: Record<string, DonationBlock> = {
donations_hero: {
block_key: "donations_hero",
title: "Soutenez l’œuvre de Dieu avec foi et générosité.",
subtitle: "Dons & Offrandes",
content:
"Votre contribution participe à la mission de l’église, à l’accompagnement des familles, à l’évangélisation et aux différentes œuvres sociales.",
primary_label: "Faire un don",
primary_href: "#moyens-don",
secondary_label: "Nous contacter",
secondary_href: "#contact-don",
},
donations_message: {
block_key: "donations_message",
title: "Donner, c’est participer à la mission.",
subtitle: "Un acte de foi et de générosité",
content:
"Chaque offrande, dîme ou contribution est reçue avec reconnaissance et utilisée dans un esprit de responsabilité, de transparence et de service.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
},
donations_mobile_money: {
block_key: "donations_mobile_money",
title: "Mobile Money",
subtitle: "Don rapide et accessible",
content:
"Les coordonnées Mobile Money seront communiquées ici par l’administration de l’église.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
},
donations_card: {
block_key: "donations_card",
title: "Carte bancaire",
subtitle: "Paiement sécurisé par carte",
content:
"Les paiements par Visa, Mastercard et autres cartes compatibles seront activés après validation de la passerelle de paiement sécurisée de l’église.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
},
donations_paypal: {
block_key: "donations_paypal",
title: "PayPal",
subtitle: "Contribution depuis l’international",
content:
"Les membres et partenaires à l’international pourront contribuer par PayPal lorsque le compte officiel de l’église sera configuré.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
},
donations_bank: {
block_key: "donations_bank",
title: "Virement bancaire",
subtitle: "Contribution par banque",
content:
"Les informations bancaires officielles de l’église seront publiées ici après validation administrative.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
},
donations_online: {
block_key: "donations_online",
title: "Paiement en ligne",
subtitle: "Paiement sécurisé en préparation",
content:
"Les dons par carte bancaire, PayPal et autres moyens sécurisés seront progressivement intégrés à PDV Connect.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
},
donations_transparency: {
block_key: "donations_transparency",
title: "Une gestion responsable et transparente.",
subtitle: "Notre engagement",
content:
"Nous nous engageons à traiter chaque contribution avec intégrité, confidentialité et responsabilité pour soutenir la vision et les œuvres de l’église.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
},
donations_contact: {
block_key: "donations_contact",
title: "Besoin d’assistance pour votre contribution ?",
subtitle: "Contact dons & offrandes",
content:
"Notre équipe administrative peut vous accompagner pour toute question relative aux dons, aux coordonnées de paiement ou à la confirmation d’une contribution.",
primary_label: "Nous écrire",
primary_href: "mailto:contact@paroledevie.cd",
secondary_label: null,
secondary_href: null,
},
};

const paymentConfigs: Array<{
key: string;
icon: LucideIcon;
}> = [
{ key: "donations_mobile_money", icon: Smartphone },
{ key: "donations_card", icon: CreditCard },
{ key: "donations_paypal", icon: Heart },
{ key: "donations_bank", icon: Building2 },
];

function isExternalLink(href: string) {
return (
href.startsWith("http://") ||
href.startsWith("https://") ||
href.startsWith("mailto:") ||
href.startsWith("tel:")
);
}

function CmsAction({
href,
className,
children,
}: {
href: string;
className: string;
children: ReactNode;
}) {
if (href.startsWith("#") || isExternalLink(href)) {
const openNewTab =
href.startsWith("http://") || href.startsWith("https://");

return (
  <a
    href={href}
    target={openNewTab ? "_blank" : undefined}
    rel={openNewTab ? "noreferrer" : undefined}
    className={className}
  >
    {children}
  </a>
);

}

return ( <Link href={href} className={className}>
{children} </Link>
);
}

export default async function DonsPage() {
const supabase = await createClient();

const { data, error } = await supabase
.from("pdv_public_blocks")
.select(
"block_key, title, subtitle, content, primary_label, primary_href, secondary_label, secondary_href"
)
.in("block_key", blockKeys);

const databaseBlocks = (data as DonationBlock[] | null) ?? [];

const blocksByKey = new Map(
databaseBlocks.map((block) => [block.block_key, block])
);

function getBlock(key: string) {
if (error) {
return fallbackBlocks[key];
}

return blocksByKey.get(key) ?? null;

}

const hero = getBlock("donations_hero");
const message = getBlock("donations_message");
const online = getBlock("donations_online");
const transparency = getBlock("donations_transparency");
const contact = getBlock("donations_contact");

const paymentOptions = paymentConfigs
.map((item) => ({
...item,
block: getBlock(item.key),
}))
.filter(
(
item
): item is {
key: string;
icon: LucideIcon;
block: DonationBlock;
} => Boolean(item.block)
);

return ( <main className="min-h-screen bg-[#f7faff]">
{hero && ( <section className="bg-gradient-to-br from-[#082553] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8"> <div className="mx-auto max-w-6xl"> <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur"> <Banknote size={17} />
{hero.subtitle || "Dons & Offrandes"} </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          {hero.title}
        </h1>

        {hero.content && (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            {hero.content}
          </p>
        )}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {hero.primary_label && hero.primary_href && (
            <CmsAction
              href={hero.primary_href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-[#0a3d82] shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              {hero.primary_label}
              <ArrowRight size={18} />
            </CmsAction>
          )}

          {hero.secondary_label && hero.secondary_href && (
            <CmsAction
              href={hero.secondary_href}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-extrabold text-white backdrop-blur transition hover:bg-white/20"
            >
              {hero.secondary_label}
            </CmsAction>
          )}
        </div>
      </div>
    </section>
  )}

  <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
    {message && (
      <div className="grid gap-6 rounded-[2rem] border border-blue-100 bg-white p-7 shadow-sm lg:grid-cols-[auto_1fr] lg:p-9">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
          <Heart size={27} />
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            {message.subtitle || "Un acte de foi et de générosité"}
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#092e63]">
            {message.title}
          </h2>

          {message.content && (
            <p className="mt-4 max-w-3xl leading-8 text-slate-600">
              {message.content}
            </p>
          )}
        </div>
      </div>
    )}

    {online && (
      <div className="mt-8 flex gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <CreditCard className="mt-1 shrink-0 text-amber-700" size={25} />

        <div>
          <p className="font-extrabold">
            {online.subtitle || "Paiement sécurisé en préparation"}
          </p>

          <h2 className="mt-1 text-lg font-black">{online.title}</h2>

          {online.content && (
            <p className="mt-2 text-sm leading-6">{online.content}</p>
          )}
        </div>
      </div>
    )}

    <div id="moyens-don" className="mt-10 grid gap-5 md:grid-cols-2">
      {paymentOptions.map(({ key, icon: Icon, block }) => (
        <article
          key={key}
          className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
            <Icon size={24} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
            {block.subtitle || "Contribution"}
          </p>

          <h2 className="mt-2 text-xl font-black text-[#092e63]">
            {block.title}
          </h2>

          {block.content && (
            <p className="mt-3 leading-7 text-slate-600">{block.content}</p>
          )}
        </article>
      ))}
    </div>
  </section>

  {(transparency || contact) && (
    <section className="border-y border-blue-100 bg-white px-5 py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        {transparency && (
          <article className="rounded-[2rem] bg-[#eef7ff] p-8">
            <ShieldCheck className="text-[#0a56a4]" size={30} />

            <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
              {transparency.subtitle || "Notre engagement"}
            </p>

            <h2 className="mt-3 text-2xl font-black text-[#092e63]">
              {transparency.title}
            </h2>

            {transparency.content && (
              <p className="mt-4 leading-7 text-slate-600">
                {transparency.content}
              </p>
            )}

            <div className="mt-6 flex gap-3 text-sm font-bold text-[#0a3d82]">
              <CheckCircle2 size={18} />
              Confidentialité et responsabilité
            </div>
          </article>
        )}

        {contact && (
          <article
            id="contact-don"
            className="rounded-[2rem] bg-gradient-to-br from-[#082553] to-[#0a56a4] p-8 text-white"
          >
            <Mail className="text-cyan-200" size={30} />

            <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-cyan-200">
              {contact.subtitle || "Contact dons & offrandes"}
            </p>

            <h2 className="mt-3 text-2xl font-black">{contact.title}</h2>

            {contact.content && (
              <p className="mt-4 leading-7 text-blue-100">
                {contact.content}
              </p>
            )}

            {contact.primary_label && contact.primary_href && (
              <CmsAction
                href={contact.primary_href}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
              >
                {contact.primary_label}
                <ArrowRight size={17} />
              </CmsAction>
            )}
          </article>
        )}
      </div>
    </section>
  )}
</main>

);
}
