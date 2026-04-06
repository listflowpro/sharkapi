import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardUserProvider } from "@/components/dashboard/DashboardUserProvider";
import { createClient } from "@/lib/supabase/server";
import type { DashboardUser } from "@/lib/auth/dashboard-user";
import { deriveDisplayNameFromEmail } from "@/lib/auth/dashboard-user";

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile (wallet_balance etc.)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const name = user.user_metadata?.full_name?.trim()
    || deriveDisplayNameFromEmail(user.email ?? "");
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p: string) => p[0].toUpperCase()).join("") || (user.email ?? "U").slice(0, 2).toUpperCase();

  const dashboardUser: DashboardUser = {
    id: user.id,
    email: user.email ?? "",
    name,
    firstName: name.split(/\s+/)[0] ?? "User",
    avatarInitials: initials,
    memberSince: new Intl.DateTimeFormat("en-US", {
      month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    }).format(new Date(user.created_at)),
    walletBalance: profile?.wallet_balance ?? 0,
    role: profile?.role ?? "user",
  };

  return (
    <DashboardUserProvider initialUser={dashboardUser}>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardUserProvider>
  );
}
