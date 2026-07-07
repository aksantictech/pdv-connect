import { createClient } from "@/lib/supabase/server";

type PublicBlock = Record<string, any>;

const PUBLIC_BUCKET = "pdv-public";

const TABLES = [
  "pdv_public_blocks",
  "public_blocks",
  "public_site_blocks",
  "cms_blocks",
];

async function getBlocks(): Promise<PublicBlock[]> {
  const supabase = await createClient();

  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) {
      console.log("Public CMS table used:", table);
      return data;
    }
  }

  console.warn("Aucune table CMS publique trouvée.");
  return [];
}

function findPastorBlock(blocks: PublicBlock[]) {
  return (
    blocks.find((block) => block.block_key === "pastor") ??
    blocks.find((block) =>
      `${block.block_key ?? ""} ${block.label ?? ""} ${block.title ?? ""}`
        .toLowerCase()
        .includes("pasteur")
    ) ??
    null
  );
}

async function getPublicImageUrl(block: PublicBlock | null) {
  if (!block) return "/images/pasteur-goby-diadia.jpeg";

  const imagePath = block.image_path;

  if (imagePath) {
    const value = String(imagePath);

    if (value.startsWith("http")) return value;
    if (value.startsWith("/")) return value;

    const supabase = await createClient();

    const { data } = supabase.storage
      .from(PUBLIC_BUCKET)
      .getPublicUrl(value);

    const version = block.updated_at
      ? `?v=${new Date(block.updated_at).getTime()}`
      : "";

    return `${data.publicUrl}${version}`;
  }

  return block.image_url || "/images/pasteur-goby-diadia.jpeg";
}

export async function getPublicHomeContent() {
  const blocks = await getBlocks();
  const pastor = findPastorBlock(blocks);

  console.log("CMS pastor block:", pastor);

  return {
    pastor: {
      title: pastor?.title || "Pasteur Goby Diadia",
      subtitle: pastor?.subtitle || "Pasteur de CEF Parole de Vie",
      description:
        pastor?.content ||
        pastor?.description ||
        pastor?.body ||
        "À travers la prédication, l’enseignement biblique et l’accompagnement spirituel, le Pasteur conduit la communauté dans une foi vivante, responsable et centrée sur la Parole de Dieu.",
      imageUrl: await getPublicImageUrl(pastor),
    },
  };
}