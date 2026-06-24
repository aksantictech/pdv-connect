import { createClient } from "../../../lib/supabase/server";
import PastorsManager from "../../../components/admin/PastorsManager";
import type {
ChurchPastor,
PastorAssemblyOption,
} from "../../../types/pastors";

export const dynamic = "force-dynamic";

type PastorRow = Omit<ChurchPastor, "assembly" | "photo_url">;

export default async function PastorsPage() {
const supabase = await createClient();

const [pastorsResult, assembliesResult] = await Promise.all([
supabase
.from("church_pastors")
.select(`         id,
        assembly_id,
        profile_id,
        pastoral_title,
        pastoral_role,
        first_name,
        last_name,
        gender,
        phone,
        email,
        date_of_birth,
        date_of_consecration,
        marital_status,
        spouse_name,
        children_count,
        biography,
        photo_path,
        is_public,
        is_active,
        created_at,
        updated_at
      `)
.order("is_active", { ascending: false })
.order("pastoral_role", { ascending: true })
.order("last_name", { ascending: true }),

supabase
  .from("assemblies")
  .select("id, name, city, country")
  .eq("is_active", true)
  .order("name"),

]);

const assemblies =
(assembliesResult.data as PastorAssemblyOption[] | null) ?? [];

const rawPastors = (pastorsResult.data as PastorRow[] | null) ?? [];

const pastors: ChurchPastor[] = await Promise.all(
rawPastors.map(async (pastor) => {
let photoUrl: string | null = null;

  if (pastor.photo_path) {
    const { data: signedPhoto } = await supabase.storage
      .from("pdv-media")
      .createSignedUrl(pastor.photo_path, 3600);

    photoUrl = signedPhoto?.signedUrl ?? null;
  }

  return {
    ...pastor,
    photo_url: photoUrl,
    assembly:
      assemblies.find((assembly) => assembly.id === pastor.assembly_id) ??
      null,
  };
})

);

const errors = [
pastorsResult.error?.message,
assembliesResult.error?.message,
].filter((message): message is string => Boolean(message));

return ( <PastorsManager
   initialPastors={pastors}
   assemblies={assemblies}
   loadError={
     errors.length > 0
? `Impossible de charger les pasteurs. Détail : ${errors.join(" | ")}`
: null
}
/>
);
}
