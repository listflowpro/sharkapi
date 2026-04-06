"use client";

import { createContext, useContext, useState } from "react";
import type { DashboardUser } from "@/lib/auth/dashboard-user";

type Ctx = {
  user: DashboardUser | null;
  setUser: (u: DashboardUser | null) => void;
};

const DashboardUserContext = createContext<Ctx | null>(null);

export function DashboardUserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: DashboardUser | null;
}) {
  const [user, setUser] = useState<DashboardUser | null>(initialUser);

  return (
    <DashboardUserContext.Provider value={{ user, setUser }}>
      {children}
    </DashboardUserContext.Provider>
  );
}

export function useDashboardUser(): DashboardUser {
  const ctx = useContext(DashboardUserContext);
  if (!ctx) throw new Error("useDashboardUser must be used inside DashboardUserProvider");
  if (!ctx.user) throw new Error("No authenticated user");
  return ctx.user;
}
