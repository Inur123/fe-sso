"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KeyRound, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface OAuthSession {
  id: string;
  expires_at: string;
  refresh_token: string;
  app?: {
    id: string;
    name: string;
  };
}

// Deduplicate — keep only latest session per app
function dedupeByApp(sessions: OAuthSession[]): OAuthSession[] {
  const map = new Map<string, OAuthSession>();
  for (const sess of sessions) {
    const key = sess.app?.id ?? sess.id;
    const existing = map.get(key);
    if (
      !existing ||
      new Date(sess.expires_at) > new Date(existing.expires_at)
    ) {
      map.set(key, sess);
    }
  }
  return Array.from(map.values());
}

function TokenCell({ token, appName }: { token: string; appName: string }) {
  const [copied, setCopied] = useState(false);
  const truncated = token.length > 32 ? `${token.slice(0, 32)}...` : token;

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("Token berhasil disalin");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5">
      <code className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
        {truncated}
      </code>
      <Dialog>
        <DialogTrigger
          render={
            <button
              className="text-slate-400 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer shrink-0"
              title="Tampilkan Token"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          }
        />
        <DialogContent className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800/80 rounded-2xl max-w-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-slate-900 dark:text-zinc-50 font-bold flex items-center gap-2">
              <KeyRound className="size-5 text-emerald-500" />
              Token Akses {appName && appName !== "—" ? appName : "Rahasia"}
            </DialogTitle>

            {/* Warning Box */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3 text-red-800 dark:text-red-400 text-xs text-left leading-relaxed">
              <span className="font-bold block mb-1">
                ⚠️ PENTING: Jangan Bagikan Token Ini!
              </span>
              Ini adalah token rahasia yang memberikan hak akses penuh ke akun
              Anda untuk aplikasi ini. Harap jaga kerahasiaannya dengan sangat
              ketat.
            </div>

            {/* Token Value Container */}
            <div className="text-left space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-zinc-500">
                Value Token
              </span>
              <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3 font-mono text-xs break-all select-all text-slate-800 dark:text-zinc-200 flex flex-col gap-2">
                <code className="leading-normal">{token}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="mt-1 h-8 w-full text-xs font-semibold rounded-lg border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-850 cursor-pointer"
                >
                  {copied ? "Tersalin!" : "Salin Token"}
                </Button>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose
              className="w-full sm:w-auto rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer"
              render={<Button variant="outline" />}
            >
              Tutup
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<OAuthSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sessions.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      const timer = setTimeout(() => {
        setCurrentPage(totalPages);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [sessions, totalPages, currentPage]);

  useEffect(() => {
    document.title = "Sesi Aktif | SSO IPNU-IPPNU Magetan";
  }, []);

  useEffect(() => {
    if (!session?.accessToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/sessions`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const response = res as { data?: OAuthSession[] };
        setSessions(dedupeByApp(response.data ?? []));
      })
      .catch(() => toast.error("Gagal memuat sesi"))
      .finally(() => setLoading(false));
  }, [session]);

  async function handleRevoke(refreshToken: string, appName: string) {
    if (!session?.accessToken) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/oauth/revoke`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      setSessions((s) =>
        s.filter((sess) => sess.refresh_token !== refreshToken),
      );
      toast.success(`Akses ${appName} berhasil dicabut`);
    } catch {
      toast.error("Gagal mencabut sesi");
    }
  }

  if (loading)
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="rounded-xl border">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-32" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 items-center px-4 py-3 border-b last:border-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );

  const paginatedSessions = sessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Sesi
        </h1>
        <p className="text-slate-500 dark:text-zinc-400">
          Aplikasi pihak ketiga yang telah kamu izinkan mengakses akunmu
        </p>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      {sessions.length === 0 ? (
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardContent className="py-16 text-center space-y-3">
            <KeyRound className="h-12 w-12 mx-auto text-emerald-500/80 dark:text-emerald-400/80" />
            <p className="font-bold text-slate-800 dark:text-zinc-200">
              Belum ada aplikasi terhubung
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Sesi akan muncul saat kamu mengizinkan aplikasi pihak ketiga
              mengakses akunmu via OAuth.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Sesi yang terhubung dan aktif
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              {sessions.length} aplikasi terhubung
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
                <TableRow className="border-b border-slate-200/60 dark:border-zinc-800/60">
                  <TableHead className="w-12 text-center text-xs font-bold text-slate-600 dark:text-zinc-400">
                    No
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    APP
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    ACCESS TOKEN
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    TIMESTAMP
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSessions.map((sess, index) => (
                  <TableRow
                    key={sess.id}
                    className="border-b border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <TableCell className="text-center font-bold text-slate-400 dark:text-zinc-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-zinc-100">
                      {sess.app?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <TokenCell
                        token={sess.refresh_token ?? "—"}
                        appName={sess.app?.name ?? "—"}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-zinc-400 whitespace-nowrap font-medium">
                      {new Date(sess.expires_at)
                        .toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                        .replace(",", "")}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0 rounded-lg cursor-pointer shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <AlertDialogContent
                          size="sm"
                          className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800/80 rounded-2xl"
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-900 dark:text-zinc-50 font-bold">
                              Cabut Akses?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 dark:text-zinc-400">
                              Apakah Anda yakin ingin mencabut akses untuk{" "}
                              <strong>
                                {sess.app?.name ?? "aplikasi ini"}
                              </strong>
                              ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer">
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRevoke(
                                  sess.refresh_token,
                                  sess.app?.name ?? "aplikasi ini",
                                )
                              }
                              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl cursor-pointer"
                            >
                              Cabut Sesi
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                  {Math.min(currentPage * itemsPerPage, sessions.length)}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {sessions.length}
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
  );
}
