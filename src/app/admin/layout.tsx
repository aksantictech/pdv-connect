import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "../../lib/supabase/server";
import AdminShell from "../../components/admin/AdminShell";
import type { AppNotification } from "../../types/notifications";

type AppRole =
  | "super_admin"
  | "pasteur_titulaire"
  | "administrateur_general"
  | "pasteur_assemblee"
  | "responsable_departement"
  | "responsable_integration"
  | "secretaire_accueil"
  | "responsable_ecole"
  | "enseignant"
  | "lecteur";

type AdminProfile = {
  full_name: string | null;
  job_title: string | null;
  photo_path: string | null;
};

const rolePriority: AppRole[] = [
  "super_admin",
  "pasteur_titulaire",
  "administrateur_general",
  "pasteur_assemblee",
  "responsable_departement",
  "responsable_integration",
  "secretaire_accueil",
  "responsable_ecole",
  "enseignant",
  "lecteur",
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion?next=/admin");
  }

  const [profileResult, rolesResult, notificationsResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, job_title, photo_path")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true }),

      supabase.rpc("get_my_notifications", {
        p_limit: 12,
      }),
    ]);

  const profile =
    (profileResult.data as unknown as AdminProfile | null) ?? null;

  const activeRoles = (rolesResult.data ?? [])
    .map((item) => item.role as AppRole)
    .filter((role): role is AppRole => rolePriority.includes(role));

  if (profileResult.error || rolesResult.error || !profile) {
    redirect("/connexion?next=/admin");
  }

  const role = rolePriority.find((item) => activeRoles.includes(item));

  if (!role) {
    redirect("/connexion?next=/admin");
  }

  let avatarUrl: string | null = null;

  if (profile.photo_path) {
    const { data: signedPhoto } = await supabase.storage
      .from("pdv-media")
      .createSignedUrl(profile.photo_path, 3600);

    avatarUrl = signedPhoto?.signedUrl ?? null;
  }

  const notifications = notificationsResult.error
    ? []
    : ((notificationsResult.data as unknown as AppNotification[] | null) ??
      []);

  return (
    <AdminShell
      fullName={profile.full_name || user.email || "Utilisateur"}
      role={role}
      profileId={user.id}
      email={user.email || ""}
      jobTitle={profile.job_title}
      avatarUrl={avatarUrl}
      notifications={notifications}
    >
      {children}
    </AdminShell>
  );
}