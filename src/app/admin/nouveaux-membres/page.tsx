import { createClient } from "@/lib/supabase/server";
import NewMembersList from "@/components/admin/NewMembersList";
import type { NewMemberRegistration } from "@/types/new-members";

export default async function NewMembersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("new_member_registrations")
    .select(`
      id,
      organization_id,
      assembly_id,
      requested_department_id,
      assigned_to_profile_id,
      first_name,
      last_name,
      gender,
      phone,
      email,
      country,
      city,
      commune,
      first_visit_date,
      needs_prayer,
      needs_counselling,
      wants_baptism,
      message,
      status,
      converted_member_id,
      created_at,
      assembly:assemblies(name, city),
      department:departments(name)
    `)
    .order("created_at", { ascending: false });

  const registrations: NewMemberRegistration[] =
    (data as unknown as NewMemberRegistration[] | null) ?? [];

  return (
    <NewMembersList
      registrations={registrations}
      loadError={
        error
          ? "Impossible de charger les inscriptions. Vérifie les droits de ton compte."
          : null
      }
    />
  );
}