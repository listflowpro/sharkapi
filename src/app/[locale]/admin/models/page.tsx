import { adminGetModels } from "@/lib/admin-data";
import { ModelsClient } from "./ModelsClient";

export default async function AdminModelsPage() {
  const models = await adminGetModels();
  return <ModelsClient initialModels={models} />;
}
