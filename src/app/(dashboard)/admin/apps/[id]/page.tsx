"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
import AdminAppDetailSkeleton from "./skeleton";
import {
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Copy,
  Search,
  Users,
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
  is_restricted: boolean;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
function resolveAvatar(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
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
    is_restricted: false,
  });

  interface UserAccess {
    user_id: string;
    name: string;
    email: string;
    image?: string;
    has_access: boolean;
  }
  const [accessList, setAccessList] = useState<UserAccess[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAccess, setLoadingAccess] = useState(false);

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
          is_restricted: response.data.is_restricted ?? false,
        });
      })
      .catch(() => toast.error("Gagal memuat detail aplikasi"))
      .finally(() => setLoading(false));
  }, [session, id, router]);

  useEffect(() => {
    if (!session?.accessToken || !id || !app?.is_restricted) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingAccess(true);
    api.apps
      .getAccessList(session.accessToken, id)
      .then((res) => {
        const response = res as { data: UserAccess[] };
        setAccessList(response.data || []);
      })
      .catch(() => toast.error("Gagal memuat daftar akses user"))
      .finally(() => setLoadingAccess(false));
  }, [session, id, app?.is_restricted]);

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
        is_restricted: form.is_restricted,
      });
      setApp((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          name: form.name,
          description: form.description,
          redirect_uris: updatedUris,
          is_restricted: form.is_restricted,
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

  async function handleToggleAccess(userId: string, currentVal: boolean) {
    if (!session?.accessToken || !id) return;
    const updatedList = accessList.map((item) =>
      item.user_id === userId ? { ...item, has_access: !currentVal } : item,
    );
    setAccessList(updatedList);
    const assignedUserIds = updatedList
      .filter((item) => item.has_access)
      .map((item) => item.user_id);
    try {
      await api.apps.updateAccessList(session.accessToken, id, assignedUserIds);
      toast.success("Akses user berhasil diperbarui");
    } catch (err) {
      const originalList = accessList.map((item) =>
        item.user_id === userId ? { ...item, has_access: currentVal } : item,
      );
      setAccessList(originalList);
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memperbarui akses user");
    }
  }

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Check if it's already in the local list
    const localMatch = accessList.some(item => 
      item.user_id.toLowerCase() === trimmed.toLowerCase()
    );

    if (localMatch) return;

    // Only search backend if it's a complete UUID (User ID)
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed);

    if (!isUUID) return;

    const delayDebounce = setTimeout(async () => {
      if (!session?.accessToken || !id) return;
      try {
        const res = (await api.apps.searchUserAccess(session.accessToken, id, trimmed)) as { data: UserAccess };
        if (res.data) {
          const found = res.data;
          if (!accessList.some(u => u.user_id === found.user_id)) {
            setAccessList(prev => [found, ...prev]);
          }
        }
      } catch {
        // Ignore search errors so it doesn't disturb typing
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, accessList, session, id]);

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

  if (loading) return <AdminAppDetailSkeleton />;

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
                    className="text-slate-500 border-slate-200 dark:border-zinc-855 font-medium rounded-lg text-[10px] sm:text-xs"
                  >
                    Nonaktif
                  </Badge>
                )}
                {app.is_restricted && (
                  <Badge className="bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/30 font-semibold shadow-none rounded-lg text-[10px] sm:text-xs">
                    Terbatas
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

      <div className={app.is_restricted ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "w-full"}>
        {/* Left/Main Column: Detail & Pengaturan Aplikasi */}
        <div className={app.is_restricted ? "lg:col-span-7 flex flex-col gap-6" : "w-full flex flex-col gap-6"}>
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-zinc-800/60 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
                Detail & Pengaturan Aplikasi
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
                Perbarui informasi aplikasi, kredensial, dan konfigurasi (admin override).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Edit Form */}
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
                      className="h-10 rounded-xl bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-850"
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
                      className="h-10 rounded-xl bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-850"
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
                      className="h-10 rounded-xl bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-850"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-950/20 hover:bg-slate-50/50 dark:hover:bg-zinc-950/40 transition-colors">
                    <div className="space-y-0.5 max-w-[80%]">
                      <Label
                        htmlFor="is_restricted"
                        className="text-sm font-bold text-slate-800 dark:text-zinc-200 cursor-pointer select-none"
                      >
                        Batasi Akses User (Restricted)
                      </Label>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-455 leading-normal">
                        Hanya user/kader ter-assign yang bisa login melalui OAuth2.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="is_restricted"
                      onClick={() => setForm({ ...form, is_restricted: !form.is_restricted })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.is_restricted ? "bg-emerald-600" : "bg-slate-200 dark:bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          form.is_restricted ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
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

                {/* Right side: Credentials & Info */}
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Credentials OAuth
                    </h3>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-655 dark:text-zinc-400">
                        Client ID
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-mono truncate">
                          {app.client_id}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copy(app.client_id, "Client ID")}
                          className="shrink-0 rounded-lg h-7 px-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-zinc-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Redirect URIs Terdaftar
                    </h3>
                    {(app.redirect_uris ?? []).length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Belum ada Redirect URI
                      </p>
                    ) : (
                      (app.redirect_uris ?? []).map((uri: string) => (
                        <div key={uri} className="flex items-center gap-2">
                          <code className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono truncate">
                            {uri}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 shrink-0 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-600"
                            onClick={() => copy(uri, "Redirect URI")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-zinc-455 font-medium">Owner ID:</span>
                      <code className="font-mono text-slate-700 dark:text-zinc-300 max-w-[150px] truncate" title={app.owner_id}>
                        {app.owner_id}
                      </code>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-zinc-455 font-medium">Terdaftar Pada:</span>
                      <span className="text-slate-700 dark:text-zinc-300 font-semibold">
                        {formatDate(app.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: User Access */}
        {app.is_restricted && (
          <div className="lg:col-span-5">
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-550">
                  Manajemen Akses User
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
                  Tentukan kader/user mana saja yang diizinkan mengakses aplikasi ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-455">
                    Akses Diberikan: <strong className="text-emerald-600 dark:text-emerald-400">{accessList.filter(item => item.has_access).length}</strong>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  <Input
                    placeholder="Cari berdasarkan User ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10.5 rounded-xl bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-850 focus:bg-white dark:focus:bg-zinc-900 transition-all text-xs"
                  />
                </div>

                {loadingAccess ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Memuat data user...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {(() => {
                      const trimmedQuery = searchQuery.trim();
                      const filtered = accessList.filter((item) => {
                        if (!trimmedQuery) return item.has_access === true;
                        const isCompleteUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmedQuery);
                        if (!isCompleteUUID) return false;
                        return item.user_id.toLowerCase() === trimmedQuery.toLowerCase();
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                            <Users className="w-8 h-8 text-slate-350 dark:text-zinc-700 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Tidak ada user ditemukan</p>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Masukkan User ID lengkap untuk mencari</p>
                          </div>
                        );
                      }

                      return filtered.map((item) => {
                        const colors = [
                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
                          "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
                          "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
                          "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
                          "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
                        ];
                        const charCodeSum = item.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const colorClass = colors[charCodeSum % colors.length];

                        return (
                          <div
                            key={item.user_id}
                            className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:shadow-xs transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-10 h-10 shrink-0">
                                {item.image ? (
                                  <Image
                                    src={resolveAvatar(item.image)}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200/60 dark:border-zinc-800"
                                    unoptimized
                                  />
                                ) : (
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${colorClass}`}>
                                    {item.name.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200 truncate">
                                  {item.name}
                                </h4>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5 font-mono text-xs">
                                  <p className="text-slate-455 dark:text-zinc-555 truncate">
                                    {item.email}
                                  </p>
                                  <span className="hidden sm:inline text-slate-300 dark:text-zinc-800">•</span>
                                  <p className="text-[10px] text-slate-400 dark:text-zinc-650 truncate">
                                    ID: {item.user_id}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleAccess(item.user_id, item.has_access)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  item.has_access ? "bg-emerald-600" : "bg-slate-200 dark:bg-zinc-800"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    item.has_access ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
