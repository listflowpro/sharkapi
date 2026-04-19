import { createServiceClient } from "@/lib/supabase/service";
import { NotificationsClient } from "./NotificationsClient";

export default async function AdminNotificationsPage() {
  const service = createServiceClient();
  const { data: configs } = await service
    .from("telegram_configs")
    .select("id, name, chat_id, is_active, created_at")
    .order("created_at", { ascending: false });

  return <NotificationsClient initialConfigs={configs ?? []} />;
}
