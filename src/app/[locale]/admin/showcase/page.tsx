import { createServiceClient } from "@/lib/supabase/service";
import { ShowcaseClient } from "./ShowcaseClient";

export default async function AdminShowcasePage() {
  const service = createServiceClient();
  const { data: images } = await service
    .from("showcase_images")
    .select("id, url, alt, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return <ShowcaseClient initialImages={images ?? []} />;
}
