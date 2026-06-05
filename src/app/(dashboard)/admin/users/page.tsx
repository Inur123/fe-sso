"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, UserX, Search } from "lucide-react";
import UsersSkeleton from "./skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  function resolveAvatarUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    const nameMatch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const emailMatch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const idMatch =
      user.id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const matchesSearch = nameMatch || emailMatch || idMatch;

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = user.is_active === true;
    } else if (statusFilter === "inactive") {
      matchesStatus = user.is_active === false;
    }

    let matchesEmail = true;
    if (emailFilter === "verified") {
      matchesEmail = user.is_verified === true;
    } else if (emailFilter === "unverified") {
      matchesEmail = user.is_verified === false;
    }

    return matchesSearch && matchesRole && matchesStatus && matchesEmail;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      const timer = setTimeout(() => {
        setCurrentPage(totalPages);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [filteredUsers, totalPages, currentPage]);

  useEffect(() => {
    document.title = "Kelola User | SSO IPNU-IPPNU Magetan";
  }, []);

  useEffect(() => {
    if (!session?.accessToken) return;
    if (session?.user?.role !== "superadmin") {
      toast.error("Akses ditolak");
      router.push("/dashboard");
      return;
    }
    api.admin.users
      .list(session.accessToken)
      .then((res) => {
        const response = res as { data: UserDetail[] };
        const rawUsers = response.data ?? [];
        setUsers(rawUsers);
      })
      .catch(() => toast.error("Gagal memuat user"))
      .finally(() => setLoading(false));
  }, [session, router]);

  if (loading) return <UsersSkeleton />;

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Kelola User
        </h1>
        <p className="text-slate-500 dark:text-zinc-400">
          {users.length} pengguna terdaftar di SSO
        </p>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      <div className="space-y-4">
        {users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-end gap-3 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 backdrop-blur-xs">
            <div className="relative flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Cari Pengguna
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <Input
                  placeholder="Cari nama, email, atau ID pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>
            <div className="w-full sm:w-[130px] space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Role
              </label>
              <Select
                value={roleFilter}
                onValueChange={(val) => setRoleFilter(val ?? "all")}
              >
                <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-emerald-500">
                  <SelectValue placeholder="Filter Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
                  <SelectItem value="all" className="rounded-lg">
                    Semua Role
                  </SelectItem>
                  {session?.user?.role !== "developer" && (
                    <SelectItem value="superadmin" className="rounded-lg">
                      Superadmin
                    </SelectItem>
                  )}
                  <SelectItem value="developer" className="rounded-lg">
                    Developer
                  </SelectItem>
                  <SelectItem value="user" className="rounded-lg">
                    User Biasa
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[130px] space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Status Akun
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
                  <SelectItem value="active" className="rounded-lg">
                    Aktif
                  </SelectItem>
                  <SelectItem value="inactive" className="rounded-lg">
                    Nonaktif
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[140px] space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Verifikasi Email
              </label>
              <Select
                value={emailFilter}
                onValueChange={(val) => setEmailFilter(val ?? "all")}
              >
                <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-emerald-500">
                  <SelectValue placeholder="Verifikasi Email" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
                  <SelectItem value="all" className="rounded-lg">
                    Semua Status
                  </SelectItem>
                  <SelectItem value="verified" className="rounded-lg">
                    Terverifikasi
                  </SelectItem>
                  <SelectItem value="unverified" className="rounded-lg">
                    Belum Verifikasi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
              Daftar Pengguna
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              Klik detail untuk mengelola role dan status akun
            </CardDescription>
          </CardHeader>
          <CardContent
            className={
              users.length === 0 ? "py-16 text-center space-y-3" : "p-0"
            }
          >
            {users.length === 0 ? (
              <>
                <UserX className="h-12 w-12 mx-auto text-emerald-500/80 dark:text-emerald-400/80" />
                <p className="text-slate-800 dark:text-zinc-200 font-bold">
                  Belum ada pengguna terdaftar
                </p>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Tidak ada akun pengguna yang terdaftar di sistem SSO ini
                </p>
              </>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-zinc-400 space-y-1">
                <p className="font-bold text-sm">
                  Tidak ada pengguna yang cocok
                </p>
                <p className="text-xs">
                  Coba ubah kata kunci pencarian atau filter Anda
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
                        Pengguna
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Role
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Status Akun
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Verifikasi Email
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className="border-b border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="text-center font-bold text-slate-400 dark:text-zinc-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-350 border border-emerald-100/40">
                              {user.image && (
                                <AvatarImage
                                  src={resolveAvatarUrl(user.image)}
                                  alt={user.name}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="text-xs font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5">
                              <p className="font-bold text-slate-900 dark:text-zinc-100">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-550 dark:text-zinc-450 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none block">
                                {user.email}
                              </p>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono select-all truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none block" title={user.id}>
                                ID: {user.id}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.role === "superadmin" ? (
                            <Badge className="bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-100 dark:border-red-900/30 font-semibold shadow-none rounded-lg capitalize">
                              Superadmin
                            </Badge>
                          ) : user.role === "developer" ? (
                            <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 font-semibold shadow-none rounded-lg capitalize">
                              Developer
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-50 text-slate-700 dark:bg-zinc-800/50 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-semibold shadow-none rounded-lg capitalize">
                              User Biasa
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
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
                        <TableCell>
                          {user.is_verified ? (
                            <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 font-semibold shadow-none rounded-lg">
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-500 border border-slate-200 dark:border-zinc-850 font-medium rounded-lg"
                            >
                              Belum Verifikasi
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              router.push(`/admin/users/${user.id}`)
                            }
                            className="h-8 w-8 p-0 shrink-0 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-600"
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
                          filteredUsers.length,
                        )}
                      </span>{" "}
                      hingga{" "}
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredUsers.length,
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {filteredUsers.length}
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
