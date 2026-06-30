import { createClient } from "../../../lib/supabase/server";
import PublicRequestsManager, {
type ManagedPublicRequest,
} from "../../../components/admin/PublicRequestsManager";

export const dynamic = "force-dynamic";

export default async function PublicRequestsPage() {
const supabase = await createClient();

// Les demandes de prière sont délibérément exclues.
const { data, error } = await supabase
.from("pdv_public_requests")
.select(
`         id,
        request_type,
        full_name,
        email,
        phone,
        subject,
        message,
        preferred_date,
        preferred_time,
        appointment_reason,
        is_testimony_public,
        status,
        admin_notes,
        created_at,
        updated_at
      `
)
.in("request_type", ["testimony", "appointment"])
.order("created_at", { ascending: false });

return (
<PublicRequestsManager
initialRequests={(data ?? []) as ManagedPublicRequest[]}
loadError={error?.message ?? null}
/>
);
}
