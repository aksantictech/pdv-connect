export type NewsStatus = "draft" | "published" | "archived";

export type NewsPost = {
id: string;
title: string;
slug: string;
excerpt: string | null;
content: string | null;
category: string;
cover_image_path: string | null;
cover_image_url: string | null;
status: NewsStatus;
is_featured: boolean;
published_at: string | null;
created_at: string;
updated_at: string;
};

export const newsStatusLabels: Record<NewsStatus, string> = {
draft: "Brouillon",
published: "Publié",
archived: "Archivé",
};

export const newsStatusStyles: Record<NewsStatus, string> = {
draft: "bg-amber-100 text-amber-800",
published: "bg-emerald-100 text-emerald-800",
archived: "bg-slate-200 text-slate-700",
};
