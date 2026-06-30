import { createClient } from "../../../lib/supabase/server";
import PublicBlocksManager from "@/components/admin/PublicBlocksManager";
import type { PublicBlock } from "../../../types/public-cms";

export const dynamic = "force-dynamic";

type PublicBlockRow = Omit<PublicBlock, "image_url">;

export default async function PublicContentPage() {
const supabase = await createClient();

const { data, error } = await supabase
.from("pdv_public_blocks")
.select(`       id,
      block_key,
      label,
      title,
      subtitle,
      content,
      primary_label,
      primary_href,
      secondary_label,
      secondary_href,
      image_path,
      data,
      is_active,
      sort_order,
      created_at,
      updated_at
    `)
.order("sort_order", { ascending: true });

const rawBlocks = (data as PublicBlockRow[] | null) ?? [];

const blocks: PublicBlock[] = rawBlocks.map((block) => {
let imageUrl: string | null = null;

if (block.image_path) {
  const { data: publicUrlData } = supabase.storage
    .from("pdv-public")
    .getPublicUrl(block.image_path);

  imageUrl = publicUrlData.publicUrl;
}

return {
  ...block,
  image_url: imageUrl,
};

});

return (
<PublicBlocksManager
initialBlocks={blocks}
loadError={
error
? `Impossible de charger les blocs du site public : ${error.message}`
: null
}
/>
);
}
