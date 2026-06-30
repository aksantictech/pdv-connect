import { createClient } from "../../../../lib/supabase/server";
import NewsManager from "../../../../components/admin/NewsManager";
import type { NewsPost } from "../../../../types/news";

export const dynamic = "force-dynamic";

type RawNewsPost = Omit<NewsPost, "cover_image_url">;

export default async function AdminNewsPage() {
const supabase = await createClient();

const { data, error } = await supabase
.from("pdv_news_posts")
.select(`       id,
      title,
      slug,
      excerpt,
      content,
      category,
      cover_image_path,
      status,
      is_featured,
      published_at,
      created_at,
      updated_at
    `)
.order("published_at", { ascending: false })
.order("created_at", { ascending: false });

const rawPosts = (data as RawNewsPost[] | null) ?? [];

const posts: NewsPost[] = rawPosts.map((post) => {
let coverImageUrl: string | null = null;

if (post.cover_image_path) {
  const { data: imageData } = supabase.storage
    .from("pdv-public")
    .getPublicUrl(post.cover_image_path);

  coverImageUrl = imageData.publicUrl;
}

return {
  ...post,
  cover_image_url: coverImageUrl,
};

});

return (
<NewsManager
initialPosts={posts}
loadError={
error
? `Impossible de charger les actualités : ${error.message}`
: null
}
/>
);
}
