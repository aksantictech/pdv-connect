import { createClient } from "@/lib/supabase/server";
import SchoolFeesManager from "../../../../components/admin/SchoolFeesManager";
import type {
SchoolFeeInstallment,
SchoolFeePlan,
SchoolFeeSchool,
SchoolFeeYear,
} from "@/types/school-fees";

export const dynamic = "force-dynamic";

export default async function SchoolFeeSettingsPage() {
const supabase = await createClient();

const [
schoolsResult,
schoolYearsResult,
feePlansResult,
installmentsResult,
] = await Promise.all([
supabase
.from("schools")
.select("id, name, city, commune, is_active")
.eq("is_active", true)
.order("name"),

supabase
  .from("school_years")
  .select(`
    id,
    school_id,
    name,
    start_date,
    end_date,
    is_current,
    is_active
  `)
  .eq("is_active", true)
  .order("start_date", { ascending: false }),

supabase
  .from("school_fee_plans")
  .select(`
    id,
    school_id,
    school_year_id,
    category,
    name,
    registration_fee,
    tuition_fee,
    currency,
    is_active,
    created_at,
    updated_at
  `)
  .order("created_at", { ascending: false }),

supabase
  .from("school_fee_installments")
  .select(`
    id,
    fee_plan_id,
    title,
    due_date,
    amount,
    sort_order,
    is_required,
    created_at
  `)
  .order("sort_order"),

]);

const schools =
(schoolsResult.data as unknown as SchoolFeeSchool[] | null) ?? [];

const schoolYears =
(schoolYearsResult.data as unknown as SchoolFeeYear[] | null) ?? [];

const rawPlans =
(feePlansResult.data as unknown as Omit<
SchoolFeePlan,
"school" | "school_year" | "installments"
>[] | null) ?? [];

const installments =
(installmentsResult.data as unknown as SchoolFeeInstallment[] | null) ??
[];

const installmentsByPlan = new Map<string, SchoolFeeInstallment[]>();

for (const installment of installments) {
const current = installmentsByPlan.get(installment.fee_plan_id) ?? [];
current.push(installment);
installmentsByPlan.set(installment.fee_plan_id, current);
}

const plans: SchoolFeePlan[] = rawPlans.map((plan) => ({
...plan,
school: schools.find((school) => school.id === plan.school_id) ?? null,
school_year:
schoolYears.find((year) => year.id === plan.school_year_id) ?? null,
installments: installmentsByPlan.get(plan.id) ?? [],
}));

const errors = [
schoolsResult.error?.message,
schoolYearsResult.error?.message,
feePlansResult.error?.message,
installmentsResult.error?.message,
].filter(Boolean);

return ( <SchoolFeesManager
   schools={schools}
   schoolYears={schoolYears}
   initialPlans={plans}
   loadError={
     errors.length > 0
? `Impossible de charger les paramètres financiers. Détail : ${errors.join(
              " | "
            )}`
: null
}
/>
);
}
