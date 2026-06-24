export type FeeCategory = "primaire" | "secondaire";

export type SchoolFeeSchool = {
id: string;
name: string;
city: string | null;
commune: string | null;
is_active: boolean;
};

export type SchoolFeeYear = {
id: string;
school_id: string | null;
name: string;
start_date: string;
end_date: string;
is_current: boolean;
is_active: boolean;
};

export type SchoolFeeInstallment = {
id: string;
fee_plan_id: string;
title: string;
due_date: string | null;
amount: number | string;
sort_order: number;
is_required: boolean;
created_at: string;
};

export type SchoolFeePlan = {
id: string;
school_id: string;
school_year_id: string;
category: FeeCategory;
name: string;
registration_fee: number | string;
tuition_fee: number | string;
currency: string;
is_active: boolean;
created_at: string;
updated_at: string;
school: SchoolFeeSchool | null;
school_year: SchoolFeeYear | null;
installments: SchoolFeeInstallment[];
};

export const feeCategoryLabels: Record<FeeCategory, string> = {
primaire: "Primaire",
secondaire: "Secondaire",
};
