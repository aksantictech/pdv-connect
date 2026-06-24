import { createClient } from "@/lib/supabase/server";
import SchoolManager from "@/components/admin/SchoolManager";
import type {
SchoolAssembly,
SchoolRecord,
SchoolYear,
} from "@/types/school";

export const dynamic = "force-dynamic";

export default async function SchoolPage() {
const supabase = await createClient();

const [assembliesResult, schoolsResult, schoolYearsResult] =
await Promise.all([
supabase
.from("assemblies")
.select("id, name, city, country")
.eq("is_active", true)
.order("name"),

  supabase
    .from("schools")
    .select(`
      id,
      organization_id,
      managing_assembly_id,
      name,
      code,
      country,
      city,
      commune,
      address,
      phone,
      email,
      responsible_name,
      responsible_phone,
      responsible_email,
      photo_path,
      is_active,
      created_at,
      updated_at
    `)
    .order("name"),

  supabase
    .from("school_years")
    .select(`
      id,
      assembly_id,
      school_id,
      name,
      start_date,
      end_date,
      is_current,
      is_active
    `)
    .order("start_date", { ascending: false }),
]);

const assemblies =
(assembliesResult.data as unknown as SchoolAssembly[] | null) ?? [];

const rawSchools =
(schoolsResult.data as unknown as SchoolRecord[] | null) ?? [];

const schools: SchoolRecord[] = rawSchools.map((school) => ({
...school,
managing_assembly:
assemblies.find(
(assembly) => assembly.id === school.managing_assembly_id
) ?? null,
}));

const rawSchoolYears =
(schoolYearsResult.data as unknown as SchoolYear[] | null) ?? [];

const schoolYears: SchoolYear[] = rawSchoolYears.map((schoolYear) => ({
...schoolYear,
organization_id: schoolYear.organization_id ?? null,
created_at: schoolYear.created_at ?? "",
assembly:
assemblies.find(
(assembly) => assembly.id === schoolYear.assembly_id
) ?? null,
school:
schools.find((school) => school.id === schoolYear.school_id) ?? null,
}));

const errors = [
assembliesResult.error?.message,
schoolsResult.error?.message,
schoolYearsResult.error?.message,
].filter(Boolean);

const loadError =
errors.length > 0
? `Impossible de charger le module École. Détail technique : ${errors.join(
          " | "
        )}`
: null;

return ( <SchoolManager
   assemblies={assemblies}
   initialSchools={schools}
   initialSchoolYears={schoolYears}
   loadError={loadError}
 />
);
}
