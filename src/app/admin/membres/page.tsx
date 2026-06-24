import { createClient } from "@/lib/supabase/server";
import MembersManager from "../../../components/admin/MembersManager";
import type {
  AssemblyOption,
  ChurchMember,
  DepartmentOption,
} from "../../../types/members";

export default async function MembersPage() {
  const supabase = await createClient();

  const [membersResult, assembliesResult, departmentsResult] =
    await Promise.all([
      supabase
        .from("members")
        .select(`
          id,
          assembly_id,
          member_number,
          first_name,
          last_name,
          gender,
          phone,
          email,
          country,
          city,
          commune,
          marital_status,
          occupation,
          joined_at,
          status,
          notes,
          is_active,
          photo_path,
          created_at,
          assembly:assemblies(name, city),
          member_departments(
            function_name,
            is_active,
            department:departments(id, name)
          )
        `)
        .order("created_at", { ascending: false }),

      supabase
        .from("assemblies")
        .select("id, name, city, country")
        .eq("is_active", true)
        .order("name"),

      supabase
        .from("departments")
        .select("id, assembly_id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

  const rawMembers =
    (membersResult.data as unknown as ChurchMember[] | null) ?? [];

  const members = await Promise.all(
    rawMembers.map(async (member) => {
      if (!member.photo_path) {
        return {
          ...member,
          photo_url: null,
        };
      }

      const { data: signedPhoto } = await supabase.storage
        .from("pdv-media")
        .createSignedUrl(member.photo_path, 3600);

      return {
        ...member,
        photo_url: signedPhoto?.signedUrl ?? null,
      };
    })
  );

  const assemblies =
    (assembliesResult.data as AssemblyOption[] | null) ?? [];

  const departments =
    (departmentsResult.data as DepartmentOption[] | null) ?? [];

  return (
    <MembersManager
      initialMembers={members}
      assemblies={assemblies}
      departments={departments}
      loadError={
        membersResult.error
          ? "Impossible de charger les membres. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}