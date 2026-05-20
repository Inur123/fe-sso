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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ShieldCheck,
  Code2,
  User,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
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

const roleLabel: Record<string, string> = {
  superadmin: "Superadmin",
  developer: "Developer",
  user: "User Biasa",
};

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

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  image?: string;
  created_at: string;
}

export default function AdminUserDetailPage() {
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!session?.accessToken || !id) return;
    if (session?.user?.role !== "superadmin") {
      toast.error("Akses ditolak");
      router.push("/dashboard");
      return;
    }
    api.admin.users
      .get(session.accessToken, id)
      .then((res) => {
        const response = res as { data: UserDetail };
        setUser(response.data);
      })
      .catch(() => toast.error("Gagal memuat detail user"))
      .finally(() => setLoading(false));
  }, [session, id, router]);

  async function handleUpdateRole(role: string) {
    if (!session?.accessToken) return;
    setUpdating(true);
    try {
      await api.admin.users.updateRole(session.accessToken, id, role);
      setUser((prev) => (prev ? { ...prev, role } : null));
      toast.success(`Role diubah menjadi ${roleLabel[role]}`);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal mengubah role");
    } finally {
      setUpdating(false);
    }
  }

  async function handleToggleActive() {
    if (!session?.accessToken || !user) return;
    setToggling(true);
    try {
      if (user.is_active) {
        await api.admin.users.deactivate(session.accessToken, id);
        setUser((prev) => (prev ? { ...prev, is_active: false } : null));
        toast.success("User berhasil dinonaktifkan");
      } else {
        await api.admin.users.activate(session.accessToken, id);
        setUser((prev) => (prev ? { ...prev, is_active: true } : null));
        toast.success("User berhasil diaktifkan");
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal mengubah status aktif");
    } finally {
      setToggling(false);
    }
  }

  const [verifying, setVerifying] = useState(false);

  async function handleVerifyEmail() {
    if (!session?.accessToken) return;
    setVerifying(true);
    try {
      await api.admin.users.verifyEmail(session.accessToken, id);
      setUser((prev) => (prev ? { ...prev, is_verified: true } : null));
      toast.success("Email user berhasil diverifikasi!");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memverifikasi email");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDelete() {
    if (!session?.accessToken) return;
    setDeleting(true);
    try {
      await api.admin.users.delete(session.accessToken, id);
      toast.success("User berhasil dihapus");
      router.push("/admin/users");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal menghapus user");
    } finally {
      setDeleting(false);
    }
  }

  function copy(text: string, label = "Teks") {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin!`);
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  function resolveAvatarUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      </div>
    );

  if (!user)
    return (
      <p className="text-muted-foreground text-center py-16">
        User tidak ditemukan
      </p>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 backdrop-blur-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/users")}
            className="h-10 w-10 shrink-0 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-350 border border-emerald-100/40 shrink-0">
              {user.image && (
                <AvatarImage
                  src={resolveAvatarUrl(user.image)}
                  alt={user.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-550">
                  {user.name}
                </h1>
                <div className="flex gap-1.5 flex-wrap">
                  {user.role === "superadmin" ? (
                    <Badge className="bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-100 dark:border-red-900/30 font-semibold shadow-none rounded-lg capitalize text-[10px] sm:text-xs">
                      Superadmin
                    </Badge>
                  ) : user.role === "developer" ? (
                    <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 font-semibold shadow-none rounded-lg capitalize text-[10px] sm:text-xs">
                      Developer
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-50 text-slate-700 dark:bg-zinc-800/50 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-semibold shadow-none rounded-lg capitalize text-[10px] sm:text-xs">
                      User Biasa
                    </Badge>
                  )}
                  {user.is_active ? (
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
                {user.email}
              </p>
            </div>
          </div>
        </div>
        {/* Toggle active button */}
        {user.role !== "superadmin" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleActive}
            disabled={toggling}
            className={
              user.is_active
                ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/25 rounded-xl cursor-pointer text-xs sm:text-sm py-1.5 h-auto w-full sm:w-auto mt-2 sm:mt-0"
                : "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-950/25 rounded-xl cursor-pointer text-xs sm:text-sm py-1.5 h-auto w-full sm:w-auto mt-2 sm:mt-0"
            }
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : user.is_active ? (
              <UserX className="h-4 w-4 mr-1.5" />
            ) : (
              <UserCheck className="h-4 w-4 mr-1.5" />
            )}
            {user.is_active ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        )}
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left — Info */}
        <div className="flex flex-col gap-4">
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
                Info Pengguna
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
                Data akun yang terdaftar di SSO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  User ID
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-650 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono truncate">
                    {user.id}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(user.id, "User ID")}
                    className="shrink-0 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-zinc-800"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Nama
                </Label>
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pl-1">
                  {user.name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Email
                </Label>
                <p className="text-sm font-medium text-slate-750 dark:text-zinc-200 pl-1">
                  {user.email}
                </p>
              </div>
              {user.phone && (
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    No. HP
                  </Label>
                  <p className="text-sm font-medium text-slate-750 dark:text-zinc-200 pl-1">
                    {user.phone}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Verifikasi Email
                </Label>
                <div className="flex items-center gap-2">
                  {user.is_verified ? (
                    <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30 font-semibold shadow-none rounded-lg">
                      Email Terverifikasi
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-slate-500 border border-slate-200 dark:border-zinc-850 font-medium rounded-lg"
                    >
                      Email Belum Terverifikasi
                    </Badge>
                  )}
                  {!user.is_verified && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={verifying}
                            className="h-7 text-xs px-2.5 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg cursor-pointer"
                          >
                            {verifying ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            Verifikasi Manual
                          </Button>
                        }
                      />
                      <AlertDialogContent
                        size="sm"
                        className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800/80 rounded-2xl"
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-slate-900 dark:text-zinc-50 font-bold">
                            Verifikasi Email?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-500 dark:text-zinc-400">
                            Apakah Anda yakin ingin memverifikasi email user{" "}
                            <strong>{user.name}</strong> secara manual?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer">
                            Batal
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleVerifyEmail}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                          >
                            Verifikasi
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Bergabung Sejak
                </Label>
                <p className="text-sm font-semibold text-slate-650 dark:text-zinc-400 pl-1">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-200 dark:border-red-900 bg-red-50/20 dark:bg-red-950/10 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle
                className={
                  user.role === "superadmin"
                    ? "text-slate-600 dark:text-zinc-400 text-base font-bold"
                    : "text-red-750 dark:text-red-400 text-base font-bold"
                }
              >
                Zona Bahaya
              </CardTitle>
              <CardDescription className="text-sm text-slate-550 dark:text-zinc-450">
                Tindakan sensitif akun
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
              {user.role === "superadmin" ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                  Akun Superadmin dilindungi sistem. Tidak dapat dihapus.
                </p>
              ) : (
                <>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Hapus Akun
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                      Semua data pengguna akan dihapus permanen
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleting}
                          className="w-full sm:w-auto rounded-xl justify-center cursor-pointer"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1.5" />
                          )}
                          Hapus
                        </Button>
                      }
                    />
                    <AlertDialogContent
                      size="sm"
                      className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800/80 rounded-2xl"
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-zinc-50 font-bold">
                          Hapus Akun?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 dark:text-zinc-400">
                          Apakah Anda yakin ingin menghapus akun user{" "}
                          <strong>{user.name}</strong> secara permanen? Tindakan
                          ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer">
                          Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive hover:bg-destructive/90 text-white rounded-xl cursor-pointer"
                        >
                          Hapus Akun
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — Role Management */}
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
              Kelola Role
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              {user.role === "superadmin"
                ? "Role Superadmin dilindungi dan tidak dapat diubah"
                : "Ubah hak akses pengguna di sistem SSO"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            {[
              {
                role: "superadmin",
                label: "Superadmin",
                desc: "Akses penuh ke semua fitur admin",
                icon: ShieldCheck,
                color: "text-red-650",
              },
              {
                role: "developer",
                label: "Developer",
                desc: "Dapat mendaftarkan dan mengelola aplikasi OAuth",
                icon: Code2,
                color: "text-amber-600",
              },
              {
                role: "user",
                label: "User Biasa",
                desc: "Akses standar, hanya fitur SSO login",
                icon: User,
                color: "text-slate-500",
              },
            ].map(({ role, label, desc, icon: Icon, color }) => (
              <div
                key={role}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                  user.role === role
                    ? "border-emerald-600 bg-emerald-50/10 dark:border-emerald-555 dark:bg-emerald-950/10"
                    : "border-slate-100 dark:border-zinc-800/60 hover:bg-slate-50/60 dark:hover:bg-zinc-900/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${color}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {label}
                    </p>
                    <p className="text-xs text-slate-550 dark:text-zinc-400 mt-0.5">
                      {desc}
                    </p>
                  </div>
                </div>
                {user.role === role ? (
                  <Badge
                    variant="outline"
                    className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30 rounded-lg shrink-0"
                  >
                    Aktif
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating || user.role === "superadmin"}
                    onClick={() => handleUpdateRole(role)}
                    className="rounded-lg h-8 shrink-0 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-slate-200 dark:border-zinc-800"
                  >
                    {updating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Terapkan"
                    )}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
