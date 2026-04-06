export type DashboardUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  avatarInitials: string;
  memberSince: string;
  walletBalance: number;
  role: "user" | "admin";
};

export function deriveDisplayNameFromEmail(email: string) {
  const [localPart = "user"] = email.split("@");
  const cleaned = localPart.replace(/[._-]+/g, " ").trim() || "User";
  return cleaned
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}
