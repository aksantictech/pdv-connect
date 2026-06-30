import { createClient } from "@/lib/supabase/server";
import AssembliesManager from "@/components/admin/AssembliesManager";
import type { AssemblyRecord } from "@/types/assemblies";

export default async function AssembliesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assemblies")
    .select(`
      id,
      name,
      slug,
      country,
      city,
      commune,
      address,
      phone,
      email,
      pastor_name,
      timezone,
      is_active,
      latitude,
longitude,
google_maps_url,
      photo_path
      
    `)
    .order("created_at", { ascending: true });

  const rawAssemblies =
    (data as unknown as AssemblyRecord[] | null) ?? [];

  const assemblies = await Promise.all(
    rawAssemblies.map(async (assembly) => {
      if (!assembly.photo_path) {
        return {
          ...assembly,
          photo_url: null,
        };
      }

      const { data: signedPhoto } = await supabase.storage
        .from("pdv-media")
        .createSignedUrl(assembly.photo_path, 3600);

      return {
        ...assembly,
        photo_url: signedPhoto?.signedUrl ?? null,
      };
    })
  );

  return (
    <AssembliesManager
      initialAssemblies={assemblies}
      loadError={
        error
          ? "Impossible de charger les assemblées. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}