"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Loader2,
  Save,
  KeyRound,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Copy,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppDetail {
  id: string;
  name: string;
  description?: string;
  redirect_uris: string[];
  client_id: string;
  owner_id: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

function formatDate(raw: string) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminAppDetailPage() {
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    redirect_uris: "",
  });

  useEffect(() => {
    if (!session?.accessToken || !id) return;
    if (session?.user?.role !== "superadmin") {
      toast.error("Akses ditolak");
      router.push("/dashboard");
      return;
    }
    api.admin.apps
      .get(session.accessToken, id)
      .then((res) => {
        const response = res as { data: AppDetail };
        setApp(response.data);
        setForm({
          name: response.data.name,
          description: response.data.description ?? "",
          redirect_uris: (response.data.redirect_uris ?? [])[0] ?? "",
        });
      })
      .catch(() => toast.error("Gagal memuat detail aplikasi"))
      .finally(() => setLoading(false));
  }, [session, id, router]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const updatedUris = form.redirect_uris.trim()
        ? [form.redirect_uris.trim()]
        : [];
      await api.admin.apps.update(session.accessToken, id, {
        name: form.name,
        description: form.description,
        redirect_uris: updatedUris,
      });
      setApp((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          name: form.name,
          description: form.description,
          redirect_uris: updatedUris,
        };
      });
      toast.success("Aplikasi berhasil diperbarui!");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal update");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    if (!session?.accessToken) return;
    setToggling(true);
    try {
      const res = (await api.admin.apps.toggleActive(
        session.accessToken,
        id,
      )) as { data: { is_active: boolean } };
      setApp((prev) => {
        if (!prev) return null;
        return { ...prev, is_active: res.data.is_active };
      });
      toast.success(
        `Aplikasi berhasil ${res.data.is_active ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal toggle");
    } finally {
      setToggling(false);
    }
  }

  async function handleApprove() {
    if (!session?.accessToken) return;
    try {
      await api.admin.apps.approve(session.accessToken, id);
      setApp((prev) => {
        if (!prev) return null;
        return { ...prev, status: "verified" };
      });
      toast.success("Aplikasi disetujui!");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal menyetujui");
    }
  }

  async function handleReject() {
    if (!session?.accessToken) return;
    try {
      await api.admin.apps.reject(session.accessToken, id);
      setApp((prev) => {
        if (!prev) return null;
        return { ...prev, status: "rejected" };
      });
      toast.warning("Aplikasi ditolak");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal menolak");
    }
  }

  function copy(text: string, label = "Teks") {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin!`);
  }

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );

  if (!app)
    return (
      <p className="text-muted-foreground text-center py-16">
        Aplikasi tidak ditemukan
      </p>
    );

  return (
    <div className="space-y-6">
      {/* Header + Back */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 backdrop-blur-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/apps")}
            className="h-10 w-10 shrink-0 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-550">
                {app.name}
              </h1>
              <div className="flex gap-1.5 flex-wrap">
                {app.status === "verified" ? (
                  <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30 font-semibold shadow-none rounded-lg text-[10px] sm:text-xs">
                    Terverifikasi
                  </Badge>
                ) : app.status === "pending" ? (
                  <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/30 font-semibold shadow-none rounded-lg text-[10px] sm:text-xs">
                    Menunggu
                  </Badge>
                ) : (
                  <Badge className="bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-100 dark:border-red-900/30 font-semibold shadow-none rounded-lg text-[10px] sm:text-xs">
                    Ditolak
                  </Badge>
                )}
                {app.is_active ? (
                  <Badge className="bg-emerald-600 text-white font-semibold shadow-sm rounded-lg text-[10px] sm:text-xs">
                    Aktif
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-slate-500 border-slate-200 dark:border-zinc-850 font-medium rounded-lg text-[10px] sm:text-xs"
                  >
                    Nonaktif
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-slate-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
              {app.description || "Tidak ada deskripsi"}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {app.status === "pending" && (
            <>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      size="sm"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer text-xs sm:text-sm py-2 sm:py-1.5 h-auto justify-center"
                    />
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Setujui
                </AlertDialogTrigger>
                <AlertDialogContent
                  size="sm"
                  className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800/80 rounded-2xl"
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-zinc-50 font-bold">
                      Setujui Aplikasi?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 dark:text-zinc-400">
                      Apakah Anda yakin ingin menyetujui aplikasi{" "}
                      <strong>{app.name}</strong>? Setelah disetujui, aplikasi
                      ini akan aktif.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApprove}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                    >
                      Setujui
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full sm:w-auto rounded-xl cursor-pointer text-xs sm:text-sm py-2 sm:py-1.5 h-auto justify-center"
                    />
                  }
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Tolak
                </AlertDialogTrigger>
                <AlertDialogContent
                  size="sm"
                  className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800/80 rounded-2xl"
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-zinc-50 font-bold">
                      Tolak Aplikasi?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 dark:text-zinc-400">
                      Apakah Anda yakin ingin menolak pendaftaran aplikasi{" "}
                      <strong>{app.name}</strong>?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      className="bg-destructive hover:bg-destructive/90 text-white rounded-xl cursor-pointer"
                    >
                      Tolak
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggle}
            disabled={toggling}
            className={
              app.is_active
                ? "w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/25 rounded-xl cursor-pointer text-xs sm:text-sm py-2 sm:py-1.5 h-auto justify-center"
                : "w-full sm:w-auto border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-950/25 rounded-xl cursor-pointer text-xs sm:text-sm py-2 sm:py-1.5 h-auto justify-center"
            }
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : app.is_active ? (
              <ToggleRight className="h-4 w-4 mr-1.5" />
            ) : (
              <ToggleLeft className="h-4 w-4 mr-1.5" />
            )}
            {app.is_active ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </div>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Credentials */}
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
                  Credentials OAuth
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
                Credentials yang digunakan aplikasi untuk SSO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Client ID
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 rounded-lg px-3 py-2 text-sm font-mono truncate">
                    {app.client_id}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(app.client_id, "Client ID")}
                    className="shrink-0 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-zinc-800"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Redirect URIs
                </Label>
                {(app.redirect_uris ?? []).map((uri: string) => (
                  <div key={uri} className="flex items-center gap-2">
                    <code className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono truncate">
                      {uri}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 shrink-0 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-600"
                      onClick={() => copy(uri, "Redirect URI")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Info Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Owner ID
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-650 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono truncate">
                    {app.owner_id}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(app.owner_id, "Owner ID")}
                    className="shrink-0 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-zinc-800"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Terdaftar Pada
                </Label>
                <p className="text-sm text-slate-600 dark:text-zinc-400 font-semibold pl-1">
                  {formatDate(app.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Edit Form */}
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-550">
              Edit Aplikasi
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              Perbarui informasi aplikasi (admin override)
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="app-name"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  Nama Aplikasi
                </Label>
                <Input
                  id="app-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="app-desc"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  Deskripsi
                </Label>
                <Input
                  id="app-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat aplikasi"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="redirect-uris"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  Redirect URI
                </Label>
                <Input
                  id="redirect-uris"
                  value={form.redirect_uris}
                  onChange={(e) =>
                    setForm({ ...form, redirect_uris: e.target.value })
                  }
                  placeholder="https://myapp.com/callback"
                  required
                />
              </div>
              <Separator className="bg-slate-200/60 dark:bg-zinc-800 my-2" />
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
