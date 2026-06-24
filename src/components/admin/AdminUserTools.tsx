"use client";

import {
useEffect,
useState,
type FormEvent,
type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
Bell,
CheckCircle2,
ChevronDown,
KeyRound,
LoaderCircle,
UserRound,
X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import PhotoPicker from "./PhotoPicker";
import type { AppNotification } from "../../types/notifications";

type AdminUserToolsProps = {
profileId: string;
fullName: string;
jobTitle: string | null;
email: string;
avatarUrl: string | null;
initialNotifications: AppNotification[];
};

type PortalDialogProps = {
children: ReactNode;
onClose: () => void;
};

function PortalDialog({ children, onClose }: PortalDialogProps) {
const [mounted, setMounted] = useState(false);

useEffect(() => {
setMounted(true);
}, []);

if (!mounted) {
return null;
}

return createPortal(
<div
className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
onMouseDown={(event) => {
if (event.target === event.currentTarget) {
onClose();
}
}}
> <div className="my-auto w-full max-w-xl rounded-[2rem] bg-white shadow-2xl">
{children} </div> </div>,
document.body
);
}

function getInitials(fullName: string) {
const value = fullName
.trim()
.split(/\s+/)
.slice(0, 2)
.map((word) => word.charAt(0).toUpperCase())
.join("");

return value || "U";
}

function getFirstName(fullName: string) {
return fullName.trim().split(/\s+/)[0] || "Utilisateur";
}

function formatNotificationDate(value: string) {
return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "short",
hour: "2-digit",
minute: "2-digit",
}).format(new Date(value));
}

export default function AdminUserTools({
profileId,
fullName,
jobTitle,
email,
avatarUrl,
initialNotifications,
}: AdminUserToolsProps) {
const router = useRouter();
const supabase = createClient();

const [notifications, setNotifications] =
useState<AppNotification[]>(initialNotifications);

const [notificationsOpen, setNotificationsOpen] = useState(false);
const [profileMenuOpen, setProfileMenuOpen] = useState(false);
const [profileModalOpen, setProfileModalOpen] = useState(false);
const [passwordModalOpen, setPasswordModalOpen] = useState(false);

const [profileFullName, setProfileFullName] = useState(fullName);
const [profileJobTitle, setProfileJobTitle] = useState(jobTitle ?? "");
const [photoFile, setPhotoFile] = useState<File | null>(null);

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [profileError, setProfileError] = useState("");
const [profileMessage, setProfileMessage] = useState("");
const [passwordError, setPasswordError] = useState("");
const [passwordMessage, setPasswordMessage] = useState("");

const [savingProfile, setSavingProfile] = useState(false);
const [savingPassword, setSavingPassword] = useState(false);

useEffect(() => {
setNotifications(initialNotifications);
}, [initialNotifications]);

const unreadCount = notifications.reduce(
(count, notification) => count + (notification.is_read ? 0 : 1),
0
);


function openProfileModal() {
setProfileFullName(fullName);
setProfileJobTitle(jobTitle ?? "");
setPhotoFile(null);
setProfileError("");
setProfileMessage("");
setProfileMenuOpen(false);
setProfileModalOpen(true);
}

function openPasswordModal() {
setCurrentPassword("");
setNewPassword("");
setConfirmPassword("");
setPasswordError("");
setPasswordMessage("");
setProfileMenuOpen(false);
setPasswordModalOpen(true);
}

async function markAsRead(notificationId: string) {
setNotifications((current) =>
current.map((notification) =>
notification.id === notificationId
? { ...notification, is_read: true }
: notification
)
);

await supabase.rpc("mark_notification_read", {
  p_notification_id: notificationId,
});

}

async function markAllAsRead() {
const unreadNotifications = notifications.filter(
(notification) => !notification.is_read
);

setNotifications((current) =>
  current.map((notification) => ({
    ...notification,
    is_read: true,
  }))
);

await Promise.all(
  unreadNotifications.map((notification) =>
    supabase.rpc("mark_notification_read", {
      p_notification_id: notification.id,
    })
  )
);

}

async function openNotification(notification: AppNotification) {
if (!notification.is_read) {
await markAsRead(notification.id);
}

setNotificationsOpen(false);

if (notification.href) {
  router.push(notification.href);
  router.refresh();
}
}
async function uploadProfilePhoto() {
if (!photoFile) {
return;
}
const extension =
  photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

const photoPath = `profiles/${profileId}/${Date.now()}.${extension}`;

const { error: uploadError } = await supabase.storage
  .from("pdv-media")
  .upload(photoPath, photoFile, {
    cacheControl: "3600",
    contentType: photoFile.type,
    upsert: false,
  });

if (uploadError) {
  throw new Error(uploadError.message);
}

const { error: updatePhotoError } = await supabase.rpc(
  "update_my_profile_photo",
  {
    p_photo_path: photoPath,
  }
);

if (updatePhotoError) {
  throw new Error(updatePhotoError.message);
}

}

async function saveProfile(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setProfileError("");
setProfileMessage("");

if (!profileFullName.trim()) {
  setProfileError("Le nom complet est obligatoire.");
  return;
}

setSavingProfile(true);

try {
  const { error } = await supabase.rpc("update_my_profile", {
    p_full_name: profileFullName.trim(),
    p_job_title: profileJobTitle.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  await uploadProfilePhoto();

  setProfileMessage("Votre profil a été mis à jour avec succès.");

  router.refresh();

  window.setTimeout(() => {
    setProfileModalOpen(false);
  }, 800);
} catch (error) {
  setProfileError(
    error instanceof Error
      ? error.message
      : "Impossible de mettre à jour votre profil."
  );
} finally {
  setSavingProfile(false);
}

}

async function savePassword(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setPasswordError("");
setPasswordMessage("");

if (!currentPassword || !newPassword || !confirmPassword) {
  setPasswordError("Veuillez renseigner tous les champs.");
  return;
}

if (currentPassword === newPassword) {
  setPasswordError(
    "Le nouveau mot de passe doit être différent de l’ancien."
  );
  return;
}

if (newPassword.length < 8) {
  setPasswordError(
    "Le nouveau mot de passe doit contenir au moins 8 caractères."
  );
  return;
}

if (newPassword !== confirmPassword) {
  setPasswordError("La confirmation du mot de passe ne correspond pas.");
  return;
}

setSavingPassword(true);

try {
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new Error("L’ancien mot de passe est incorrect.");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  setPasswordMessage("Votre mot de passe a été modifié avec succès.");

  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");

  window.setTimeout(() => {
    setPasswordModalOpen(false);
  }, 900);
} catch (error) {
  setPasswordError(
    error instanceof Error
      ? error.message
      : "Impossible de modifier le mot de passe."
  );
} finally {
  setSavingPassword(false);
}

}

return (
<> <div className="relative flex items-center gap-2"> <div className="relative">
<button
type="button"
onClick={() => {
setNotificationsOpen((current) => !current);

setProfileMenuOpen(false);
}}
className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-[#0a3d82] transition hover"
aria-label="Notifications"
> <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {notificationsOpen && (
        <div className="absolute right-0 top-11 z-[200] w-[330px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-black text-[#092e63]">
                Notifications
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Activités, communications et programmes
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-extrabold text-[#0a56a4] hover:underline"
              >
                Tout lire
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-7 text-center text-sm text-slate-500">
                Aucune notification pour le moment.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-blue-50 ${
                    notification.is_read ? "bg-white" : "bg-blue-50/70"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-sm font-bold text-[#092e63]">
                        {notification.title}
                      </span>

                      {!notification.is_read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1680c4]" />
                      )}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      {notification.message}
                    </span>

                    <span className="mt-1.5 block text-[10px] text-slate-400">
                      {formatNotificationDate(notification.created_at)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>

    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setProfileMenuOpen((current) => !current);
          setNotificationsOpen(false);
        }}
        className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-[#f5f8ff] py-1 pl-1 pr-2 text-left transition hover:bg-blue-100"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#0a3d82] text-[11px] font-black text-white">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(fullName)
          )}
        </span>

<span className="hidden max-w-44 truncate text-xs font-black text-[#0a3d82] lg:block">
  Bienvenue {getFirstName(fullName)}
</span>

        <ChevronDown
          size={15}
          className="hidden text-[#0a3d82] lg:block"
        />
      </button>

      {profileMenuOpen && (
        <div className="absolute right-0 top-12 z-[200] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 p-4">
            <p className="truncate text-sm font-black text-[#092e63]">
              {fullName}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {email}
            </p>
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={openProfileModal}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a3d82]"
            >
              <UserRound size={17} />
              Modifier mon profil
            </button>

            <button
              type="button"
              onClick={openPasswordModal}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a3d82]"
            >
              <KeyRound size={17} />
              Modifier mon mot de passe
            </button>
          </div>
        </div>
      )}
    </div>
  </div>

  {profileModalOpen && (
    <PortalDialog onClose={() => setProfileModalOpen(false)}>
      <div className="flex items-start justify-between border-b border-slate-100 p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
            Mon compte
          </p>

          <h2 className="mt-2 text-xl font-black text-[#092e63]">
            Modifier mon profil
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setProfileModalOpen(false)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={saveProfile} className="p-6">
        {profileError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {profileError}
          </div>
        )}

        {profileMessage && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0" />
            {profileMessage}
          </div>
        )}

        <div className="mb-5">
          <PhotoPicker
            label="Photo de profil"
            file={photoFile}
            onChange={setPhotoFile}
            onError={setProfileError}
          />
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Nom complet *
            </span>

            <input
              value={profileFullName}
              onChange={(event) => setProfileFullName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Fonction / titre
            </span>

            <input
              value={profileJobTitle}
              onChange={(event) => setProfileJobTitle(event.target.value)}
              placeholder="Ex. Administrateur général"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
          >
            {savingProfile && (
              <LoaderCircle size={17} className="animate-spin" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </PortalDialog>
  )}

  {passwordModalOpen && (
    <PortalDialog onClose={() => setPasswordModalOpen(false)}>
      <div className="flex items-start justify-between border-b border-slate-100 p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
            Sécurité
          </p>

          <h2 className="mt-2 text-xl font-black text-[#092e63]">
            Modifier mon mot de passe
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setPasswordModalOpen(false)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={savePassword} className="p-6">
        {passwordError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {passwordError}
          </div>
        )}

        {passwordMessage && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0" />
            {passwordMessage}
          </div>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Ancien mot de passe *
            </span>

            <input
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Nouveau mot de passe *
            </span>

            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Confirmer le nouveau mot de passe *
            </span>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
              required
            />
          </label>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Minimum 8 caractères et différent de l’ancien mot de passe.
        </p>

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setPasswordModalOpen(false)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
          >
            {savingPassword && (
              <LoaderCircle size={17} className="animate-spin" />
            )}
            Modifier le mot de passe
          </button>
        </div>
      </form>
    </PortalDialog>
  )}
</>

);
}
