"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
Bell,
CheckCheck,
ClipboardList,
LoaderCircle,
MessageSquareHeart,
CalendarDays,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";

type PublicRequestAlert = {
id: string;
request_id: string;
request_type: "testimony" | "appointment";
title: string;
body: string;
is_read: boolean;
created_at: string;
};

function formatAlertDate(value: string) {
return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "short",
hour: "2-digit",
minute: "2-digit",
}).format(new Date(value));
}

export default function PublicRequestAlerts() {
const supabase = useMemo(() => createClient(), []);

const [alerts, setAlerts] = useState<PublicRequestAlert[]>([]);
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(true);
const [updatingId, setUpdatingId] = useState<string | null>(null);
const [loadError, setLoadError] = useState("");

const unreadCount = alerts.filter((alert) => !alert.is_read).length;

useEffect(() => {
async function loadAlerts() {
setLoading(true);
setLoadError("");

  const { data, error } = await supabase
    .from("pdv_public_request_alerts")
    .select(
      "id, request_id, request_type, title, body, is_read, created_at"
    )
    .in("request_type", ["testimony", "appointment"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    setLoadError("Impossible de charger les alertes.");
    setLoading(false);
    return;
  }

  setAlerts((data ?? []) as PublicRequestAlert[]);
  setLoading(false);
}

loadAlerts();

}, [supabase]);

async function markAsRead(alert: PublicRequestAlert) {
if (alert.is_read || updatingId) return;

setUpdatingId(alert.id);

const { error } = await supabase.rpc(
  "mark_pdv_public_request_alert_read",
  {
    p_alert_id: alert.id,
  }
);

setUpdatingId(null);

if (error) return;

setAlerts((current) =>
  current.map((item) =>
    item.id === alert.id
      ? {
          ...item,
          is_read: true,
        }
      : item
  )
);

}

async function markAllAsRead() {
const unreadAlerts = alerts.filter((alert) => !alert.is_read);

for (const alert of unreadAlerts) {
  await markAsRead(alert);
}

}

return ( <div className="relative">
<button
type="button"
onClick={() => setOpen((current) => !current)}
className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0a56a4]"
aria-label="Voir les alertes de demandes publiques"
> <Bell size={19} />

    {unreadCount > 0 && (
      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>

  {open && (
    <div className="absolute right-0 top-12 z-[120] w-[360px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="font-black text-[#092e63]">Demandes publiques</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Rendez-vous et témoignages uniquement
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0a56a4] hover:text-[#072d61]"
          >
            <CheckCheck size={15} />
            Tout lire
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm font-semibold text-slate-500">
            <LoaderCircle className="animate-spin" size={18} />
            Chargement…
          </div>
        )}

        {!loading && loadError && (
          <p className="px-5 py-8 text-center text-sm text-red-600">
            {loadError}
          </p>
        )}

        {!loading && !loadError && alerts.length === 0 && (
          <div className="px-5 py-10 text-center">
            <ClipboardList className="mx-auto text-slate-300" size={30} />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Aucune nouvelle alerte.
            </p>
          </div>
        )}

        {!loading &&
          !loadError &&
          alerts.map((alert) => {
            const isAppointment = alert.request_type === "appointment";
            const Icon = isAppointment
              ? CalendarDays
              : MessageSquareHeart;

            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => markAsRead(alert)}
                className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-blue-50 ${
                  !alert.is_read ? "bg-blue-50/60" : "bg-white"
                }`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#0a56a4]">
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-extrabold text-[#092e63]">
                      {alert.title}
                    </p>

                    {!alert.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                    {alert.body}
                  </p>

                  <p className="mt-2 text-[11px] font-semibold text-slate-400">
                    {formatAlertDate(alert.created_at)}
                  </p>
                </div>
              </button>
            );
          })}
      </div>

      <div className="border-t border-slate-100 p-3">
        <Link
          href="/admin/demandes"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
        >
          <ClipboardList size={17} />
          Gérer les demandes
        </Link>
      </div>
    </div>
  )}
</div>

);
}
