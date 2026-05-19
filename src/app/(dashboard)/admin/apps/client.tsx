"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, AppWindow, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  verified: "default",
  rejected: "destructive",
};
const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

export default function AdminAppsClient({
  pendingApps: initialPending,
  allApps: initialAll,
  token,
}: {
  pendingApps: any[];
  allApps: any[];
  token: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(initialPending);
  const [all, setAll] = useState(initialAll);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredAll = all.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const totalPages = Math.ceil(filteredAll.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredAll, totalPages, currentPage]);

  const paginatedAll = filteredAll.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  async function handleApprove(id: string) {
    try {
      await api.admin.apps.approve(token, id);
      setPending((p) => p.filter((a) => a.id !== id));
      setAll((a) =>
        a.map((app) => (app.id === id ? { ...app, status: "verified" } : app)),
      );
      toast.success("Aplikasi disetujui");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleReject(id: string) {
    try {
      await api.admin.apps.reject(token, id);
      setPending((p) => p.filter((a) => a.id !== id));
      setAll((a) =>
        a.map((app) => (app.id === id ? { ...app, status: "rejected" } : app)),
      );
      toast.warning("Aplikasi ditolak");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Kelola Aplikasi
        </h1>
        <p className="text-slate-500 dark:text-zinc-400">
          Review dan setujui aplikasi yang didaftarkan developer
        </p>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      {/* Pending */}
      {pending.length > 0 && (
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
                Menunggu Persetujuan
              </CardTitle>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30 font-semibold shadow-none rounded-lg">
                {pending.length}
              </Badge>
            </div>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              Aplikasi yang perlu ditinjau
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
                  <TableRow className="border-b border-slate-200/60 dark:border-zinc-800/60">
                    <TableHead className="w-12 text-center text-xs font-bold text-slate-600 dark:text-zinc-400">
                      No
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                      Nama
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                      Client ID
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                      Redirect URI
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-slate-600 dark:text-zinc-400">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((app, index) => (
                    <TableRow
                      key={app.id}
                      className="border-b border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <TableCell className="text-center font-bold text-slate-400 dark:text-zinc-500">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-900 dark:text-zinc-100">
                          {app.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {app.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-850 px-2 py-0.5 rounded-lg font-mono truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[180px] block">
                          {app.client_id}
                        </code>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        {app.redirect_uris?.[0]}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/apps/${app.id}`)}
                            className="h-8 rounded-lg border-slate-200 dark:border-zinc-850 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-1.5" /> Detail
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(app.id)}
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" /> Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(app.id)}
                            className="h-8 rounded-lg cursor-pointer"
                          >
                            <XCircle className="h-4 w-4 mr-1.5" /> Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All apps */}
      <div className="space-y-4">
        {all.length > 0 && (
          <div className="flex flex-col sm:flex-row items-end gap-3 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 backdrop-blur-xs">
            <div className="relative flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Cari Aplikasi
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-550" />
                <Input
                  placeholder="Cari nama aplikasi atau Client ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-zinc-950"
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
                <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-emerald-500">
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
                <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-emerald-500">
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
        )}

        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-550">
              Semua Aplikasi
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              {all.length} aplikasi terdaftar
            </CardDescription>
          </CardHeader>
          <CardContent
            className={all.length === 0 ? "py-16 text-center space-y-3" : "p-0"}
          >
            {all.length === 0 ? (
              <>
                <AppWindow className="h-12 w-12 mx-auto text-emerald-500/80 dark:text-emerald-400/80" />
                <p className="text-slate-800 dark:text-zinc-200 font-bold">
                  Belum ada aplikasi terdaftar
                </p>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Belum ada developer yang mendaftarkan aplikasi
                </p>
              </>
            ) : filteredAll.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-zinc-400 space-y-1">
                <p className="font-bold text-sm">
                  Tidak ada aplikasi yang cocok
                </p>
                <p className="text-xs">
                  Coba ubah kata kunci pencarian atau filter status Anda
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
                    <TableRow className="border-b border-slate-200/60 dark:border-zinc-800/60">
                      <TableHead className="w-12 text-center text-xs font-bold text-slate-600 dark:text-zinc-400">
                        No
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Nama
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
                    {paginatedAll.map((app, index) => (
                      <TableRow
                        key={app.id}
                        className="border-b border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="text-center font-bold text-slate-400 dark:text-zinc-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-slate-900 dark:text-zinc-100">
                            {app.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            {app.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-850 px-2 py-0.5 rounded-lg font-mono truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[180px] block">
                            {app.client_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          {app.status === "verified" ? (
                            <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30 font-semibold shadow-none rounded-lg capitalize">
                              Terverifikasi
                            </Badge>
                          ) : app.status === "pending" ? (
                            <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/30 font-semibold shadow-none rounded-lg capitalize">
                              Menunggu
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-100 dark:border-red-900/30 font-semibold shadow-none rounded-lg capitalize">
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
                              className="text-slate-500 border-slate-200 dark:border-zinc-850 font-medium rounded-lg"
                            >
                              Nonaktif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/admin/apps/${app.id}`)}
                            className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/20 dark:bg-zinc-900/10">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Menampilkan{" "}
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {Math.min(
                          (currentPage - 1) * itemsPerPage + 1,
                          filteredAll.length,
                        )}
                      </span>{" "}
                      hingga{" "}
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredAll.length,
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {filteredAll.length}
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
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((p) => (
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
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 text-xs rounded-lg border-slate-200 dark:border-zinc-800"
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
