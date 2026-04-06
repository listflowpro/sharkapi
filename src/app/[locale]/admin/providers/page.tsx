import { adminGetProviders } from "@/lib/admin-data";
import { ProvidersClient } from "./ProvidersClient";

export default async function AdminProvidersPage() {
  const providers = await adminGetProviders();
  return <ProvidersClient initialProviders={providers} />;
}
