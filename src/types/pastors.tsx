export type PastorRole =
| "pasteur_titulaire"
| "pasteur_assistant"
| "pasteur_assemblee"
| "pasteur_jeunesse"
| "pasteur_enfants"
| "evangeliste"
| "autre";

export type PastorGender = "homme" | "femme" | "non_renseigne";

export type PastorMaritalStatus =
| "celibataire"
| "marie"
| "veuf_ve"
| "divorce"
| "non_renseigne";

export type PastorAssemblyOption = {
id: string;
name: string;
city: string | null;
country: string | null;
};

export type ChurchPastor = {
id: string;
assembly_id: string;
profile_id: string | null;
pastoral_title: string;
pastoral_role: PastorRole;
first_name: string;
last_name: string;
gender: PastorGender;
phone: string | null;
email: string | null;
date_of_birth: string | null;
date_of_consecration: string | null;
marital_status: PastorMaritalStatus;
spouse_name: string | null;
children_count: number;
biography: string | null;
photo_path: string | null;
photo_url: string | null;
is_public: boolean;
is_active: boolean;
created_at: string;
updated_at: string;
assembly: PastorAssemblyOption | null;
};

export const pastoralRoleLabels: Record<PastorRole, string> = {
pasteur_titulaire: "Pasteur titulaire",
pasteur_assistant: "Pasteur assistant",
pasteur_assemblee: "Pasteur d’assemblée",
pasteur_jeunesse: "Pasteur de la jeunesse",
pasteur_enfants: "Pasteur des enfants",
evangeliste: "Évangéliste",
autre: "Autre responsabilité",
};

export const pastorGenderLabels: Record<PastorGender, string> = {
homme: "Homme",
femme: "Femme",
non_renseigne: "Non renseigné",
};

export const pastorMaritalStatusLabels: Record<PastorMaritalStatus, string> = {
celibataire: "Célibataire",
marie: "Marié(e)",
veuf_ve: "Veuf / Veuve",
divorce: "Divorcé(e)",
non_renseigne: "Non renseigné",
};
