import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import AdminAppsClient from "./client";

export const metadata: Metadata = {
  title: "Kelola Aplikasi",
};

interface AdminApp {
  id: string;
  name: string;
  client_id: string;
  status: string;
  is_active: boolean;
  description?: string;
}

export default async function AdminAppsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "superadmin") redirect("/dashboard");

  let pendingApps: AdminApp[] = [];
  let allApps: AdminApp[] = [];

  try {
    const [pendingRes, allRes] = (await Promise.all([
      api.admin.apps.pending(session.accessToken),
      api.admin.apps.list(session.accessToken),
    ])) as [{ data: AdminApp[] }, { data: AdminApp[] }];
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
