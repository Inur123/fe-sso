import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppWindow, KeyRound, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import CopyableId from "@/components/copyable-id";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  function resolveAvatarUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  let profile: any = null;
  try {
    const res: any = await api.user.me(session.accessToken);
    profile = res.data;
  } catch {}

  const quickLinks = [
    {
      href: "/apps",
      label: "Aplikasi Saya",
      description: "Kelola app yang kamu daftarkan ke SSO",
      icon: AppWindow,
    },
    {
      href: "/sessions",
      label: "Sesi Aktif",
      description: "Lihat dan cabut sesi OAuth aktif",
      icon: KeyRound,
    },
    {
      href: "/profile",
      label: "Edit Profil",
      description: "Perbarui nama, foto, dan data diri",
      icon: User,
    },
  ];

  const name = profile?.name ?? session.user.name;
  const email = profile?.email ?? session.user.email;
  const role = profile?.role ?? session.user.role ?? "user";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-zinc-400">
          Selamat datang kembali,{" "}
          <span className="font-semibold text-slate-900 dark:text-zinc-100">
            {name}
          </span>{" "}
          👋
        </p>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      {/* Profile card */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-zinc-50">
            Informasi Akun
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
            Detail akun SSO kamu
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-50 dark:bg-zinc-800 flex items-center justify-center font-bold text-xl border border-slate-200 dark:border-zinc-700 ring-4 ring-emerald-500/10 dark:ring-emerald-400/10 shrink-0">
            {profile?.image || session.user.image ? (
              <img
                src={resolveAvatarUrl(
                  profile?.image ?? session.user.image ?? "",
                )}
                alt={name}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-slate-700 dark:text-zinc-300">
                {name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="space-y-1 w-full min-w-0">
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-50 truncate">
              {name}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400 break-all">
              {email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50 font-semibold px-2.5 py-0.5 capitalize shadow-none">
                {role}
              </Badge>
              {profile?.gender && (
                <Badge
                  variant="outline"
                  className="text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 px-2.5 py-0.5 capitalize font-medium"
                >
                  {profile.gender}
                </Badge>
              )}
              {profile?.is_verified && (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-0.5 shadow-sm">
                  Terverifikasi
                </Badge>
              )}
              <CopyableId id={profile?.id ?? session.user.id} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => (
          <Card
            key={item.href}
            className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden hover:border-emerald-500/30 dark:hover:border-emerald-400/30 hover:shadow-lg dark:hover:shadow-none transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
                {item.label}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-5">
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors hover:underline"
              >
                Buka <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
