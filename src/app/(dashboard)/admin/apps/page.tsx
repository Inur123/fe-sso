import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import AdminAppsClient from "./client";

export const metadata: Metadata = {
  title: "Kelola Aplikasi",
};

export default async function AdminAppsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "superadmin") redirect("/dashboard");

  let pendingApps: any[] = [];
  let allApps: any[] = [];

  try {
    const [pendingRes, allRes]: any[] = await Promise.all([
      api.admin.apps.pending(session.accessToken),
      api.admin.apps.list(session.accessToken),
    ]);
    pendingApps = pendingRes.data ?? [];
    allApps = allRes.data ?? [];
  } catch {}

  return (
    <AdminAppsClient
      pendingApps={pendingApps}
      allApps={allApps}
      token={session.accessToken}
    />
  );
}
