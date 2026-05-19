"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Copy, Eye, AppWindow, Loader2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AppsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    redirect_uris: "",
    logo_url: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description &&
        app.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.client_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    let matchesActive = true;
    if (activeFilter === "active") {
      matchesActive = app.is_active === true;
    } else if (activeFilter === "inactive") {
      matchesActive = app.is_active === false;
    }

    return matchesSearch && matchesStatus && matchesActive;
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredApps, totalPages, currentPage]);

  useEffect(() => {
    document.title = "Aplikasi Saya | SSO IPNU-IPPNU Magetan";
  }, []);

  useEffect(() => {
    loadApps();
  }, [session]);

  async function loadApps() {
    if (!session?.accessToken) return;
    try {
      const res: any = await api.apps.list(session.accessToken);
      setApps(res.data ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setCreating(true);
    try {
      const res: any = await api.apps.create(session.accessToken, {
        name: form.name,
        description: form.description,
        redirect_uris: form.redirect_uris.trim()
          ? [form.redirect_uris.trim()]
          : [],
        logo_url: form.logo_url,
      });
      setNewSecret(res.data.client_secret);
      setApps((prev) => [...prev, res.data]);
      setForm({ name: "", description: "", redirect_uris: "", logo_url: "" });
      toast.success("Aplikasi berhasil didaftarkan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mendaftar aplikasi");
    } finally {
      setCreating(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Disalin!");
  }

  if (loading)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-9 w-28 rounded" />
        </div>
        <Skeleton className="h-px w-full" />

        {/* Skeleton for Filters outside the card */}
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full space-y-1">
            <Skeleton className="h-3.5 w-10 rounded" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="w-full sm:w-[150px] space-y-1">
            <Skeleton className="h-3.5 w-12 rounded" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="w-full sm:w-[150px] space-y-1">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b last:border-0"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    );

  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-550">
            Aplikasi Saya
          </h1>
          <p className="text-slate-500 dark:text-zinc-400">
            Kelola aplikasi yang terdaftar ke SSO
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-9 w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Daftar Aplikasi Baru
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-zinc-50">
                Daftar Aplikasi Baru
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400">
                Aplikasi berstatus{" "}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  pending
                </strong>{" "}
                hingga disetujui superadmin.
              </DialogDescription>
            </DialogHeader>
            {newSecret ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-2">
                  <p className="text-sm font-semibold text-emerald-850 dark:text-emerald-400">
                    ⚠️ Simpan Client Secret ini sekarang!
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Secret hanya ditampilkan sekali demi keamanan.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 text-xs bg-slate-100 dark:bg-zinc-950 px-3 py-2 rounded-lg break-all font-mono border border-slate-200/60 dark:border-zinc-800 text-slate-800 dark:text-zinc-300">
                      {newSecret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copy(newSecret)}
                      className="rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-zinc-800"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                  onClick={() => {
                    setNewSecret(null);
                    setDialogOpen(false);
                  }}
                >
                  Sudah disimpan
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Nama Aplikasi *
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Siskader IPNU"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Deskripsi
                  </Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Deskripsi singkat aplikasi"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Redirect URI *
                  </Label>
                  <Input
                    value={form.redirect_uris}
                    onChange={(e) =>
                      setForm({ ...form, redirect_uris: e.target.value })
                    }
                    placeholder="https://myapp.com/callback"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl mt-2"
                  disabled={creating}
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Daftar Aplikasi
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      {apps.length === 0 ? (
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardContent className="py-16 text-center space-y-3">
            <AppWindow className="h-12 w-12 mx-auto text-emerald-500/80 dark:text-emerald-400/80" />
            <p className="text-slate-800 dark:text-zinc-200 font-bold">
              Belum ada aplikasi terdaftar
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Klik "Daftar Aplikasi Baru" untuk memulai integrasi.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-end gap-3 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 backdrop-blur-xs">
            <div className="relative flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Cari Aplikasi
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <Input
                  placeholder="Cari nama aplikasi atau Client ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-[150px] space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val ?? "all")}
              >
                <SelectTrigger className="w-full h-9 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-emerald-500">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
                  <SelectItem value="all" className="rounded-lg">
                    Semua Status
                  </SelectItem>
                  <SelectItem value="pending" className="rounded-lg">
                    Menunggu
                  </SelectItem>
                  <SelectItem value="verified" className="rounded-lg">
                    Terverifikasi
                  </SelectItem>
                  <SelectItem value="rejected" className="rounded-lg">
                    Ditolak
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[150px] space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Aktif/Nonaktif
              </label>
              <Select
                value={activeFilter}
                onValueChange={(val) => setActiveFilter(val ?? "all")}
              >
                <SelectTrigger className="w-full h-9 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-emerald-500">
                  <SelectValue placeholder="Filter Aktif" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
                  <SelectItem value="all" className="rounded-lg">
                    Semua Aktivitas
                  </SelectItem>
                  <SelectItem value="active" className="rounded-lg">
                    Aktif
                  </SelectItem>
                  <SelectItem value="inactive" className="rounded-lg">
                    Nonaktif
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
              <CardContent className="py-12 text-center text-slate-500 dark:text-zinc-400 space-y-2">
                <p className="font-bold text-slate-700 dark:text-zinc-300">
                  Tidak ada aplikasi yang cocok
                </p>
                <p className="text-xs">
                  Coba ubah kata kunci pencarian atau filter status Anda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
                    <TableRow className="border-b border-slate-200/60 dark:border-zinc-800/60">
                      <TableHead className="w-12 text-center text-xs font-bold text-slate-600 dark:text-zinc-400">
                        No
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Aplikasi
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Client ID
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Aktif
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApps.map((app, index) => (
                      <TableRow
                        key={app.id}
                        className="border-b border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="text-center font-bold text-slate-400 dark:text-zinc-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-zinc-100">
                              {app.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {app.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 w-fit">
                            <code className="text-xs bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-zinc-800 max-w-[200px] truncate block font-mono">
                              {app.client_id}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 shrink-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-600"
                              onClick={() => copy(app.client_id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.status === "verified" ? (
                            <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30 font-semibold shadow-none rounded-lg">
                              Terverifikasi
                            </Badge>
                          ) : app.status === "pending" ? (
                            <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/30 font-semibold shadow-none rounded-lg">
                              Menunggu
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-100 dark:border-red-900/30 font-semibold shadow-none rounded-lg">
                              Ditolak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {app.is_active ? (
                            <Badge className="bg-emerald-600 text-white font-semibold shadow-sm rounded-lg">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-500 border-slate-200 dark:border-zinc-800 font-medium rounded-lg"
                            >
                              Nonaktif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/apps/${app.id}`)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/20 dark:bg-zinc-900/10">
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Menampilkan{" "}
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    hingga{" "}
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredApps.length,
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {filteredApps.length}
                    </span>{" "}
                    data
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="h-8 px-3 text-xs rounded-lg border-slate-200 dark:border-zinc-800"
                    >
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <Button
                            key={p}
                            variant={p === currentPage ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(p)}
                            className={cn(
                              "h-8 w-8 text-xs font-semibold rounded-lg",
                              p === currentPage
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50",
                            )}
                          >
                            {p}
                          </Button>
                        ),
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 text-xs rounded-lg border-slate-200 dark:border-zinc-800"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
