export type PublicBlock = {
id: string;
block_key: string;
label: string;
title: string | null;
subtitle: string | null;
content: string | null;
primary_label: string | null;
primary_href: string | null;
secondary_label: string | null;
secondary_href: string | null;
image_path: string | null;
image_url: string | null;
data: Record<string, unknown>;
is_active: boolean;
sort_order: number;
created_at: string;
updated_at: string;
};

export type PublicBlockForm = {
blockKey: string;
label: string;
title: string;
subtitle: string;
content: string;
primaryLabel: string;
primaryHref: string;
secondaryLabel: string;
secondaryHref: string;
isActive: boolean;
sortOrder: string;
};

export const publicBlockDescriptions: Record<string, string> = {
hero: "Bannière principale, titre, texte d’accueil et boutons d’action.",
pastor:
"Présentation du Pasteur, biographie, titre pastoral et lien vers les enseignements.",
practical_info:
"Horaires des cultes, adresse et informations pratiques de l’église.",
news:
"Titre, texte introductif et bouton du bloc Actualités.",
};

export function createPublicBlockForm(block?: PublicBlock): PublicBlockForm {
return {
blockKey: block?.block_key ?? "",
label: block?.label ?? "",
title: block?.title ?? "",
subtitle: block?.subtitle ?? "",
content: block?.content ?? "",
primaryLabel: block?.primary_label ?? "",
primaryHref: block?.primary_href ?? "",
secondaryLabel: block?.secondary_label ?? "",
secondaryHref: block?.secondary_href ?? "",
isActive: block?.is_active ?? true,
sortOrder: String(block?.sort_order ?? 0),
};
}
