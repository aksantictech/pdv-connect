import { createClient } from "../../../../lib/supabase/server";
import GalleryManager, {
type GalleryItem,
} from "../../../../components/admin/GalleryManager";


export const dynamic = "force-dynamic";

type RawGalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_path: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export default async function GalleryAdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pdv_gallery_items")
    .select(
      `
        id,
        title,
        description,
        category,
        image_path,
        is_published,
        is_featured,
        sort_order,
        created_at,
        updated_at
      `
    )
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const rawItems = (data ?? []) as RawGalleryItem[];

  const items: GalleryItem[] = rawItems.map((item) => {
    const { data: imageData } = supabase.storage
      .from("pdv-public")
      .getPublicUrl(item.image_path);

    return {
      ...item,
      image_url: imageData.publicUrl,
    };
  });

  return (
    <GalleryManager
      initialItems={items}
      loadError={error?.message ?? null}
    />
  );
}