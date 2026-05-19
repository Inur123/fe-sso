"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  // Passing initial session dari server → useSession() langsung "authenticated"
  // tanpa fase "loading" → tidak ada flicker pada sidebar, header, menu admin
  return (
    <SessionProvider session={session}>
      <SidebarProvider>{children}</SidebarProvider>
    </SessionProvider>
  );
}
