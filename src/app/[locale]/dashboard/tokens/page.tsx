import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApiKeys } from "@/lib/data";
import { TokensClient } from "./TokensClient";

export default async function TokensPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const keys = await getApiKeys(supabase);
  return <TokensClient initialKeys={keys} />;
}
