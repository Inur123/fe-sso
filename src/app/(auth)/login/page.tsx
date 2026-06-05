"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, EyeOff, User, ArrowRight, Trash2 } from "lucide-react";

interface SavedAccount {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  refreshToken: string;
  lastLogin: number;
}

function LoginInner() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [view, setView] = useState<"login" | "select-account">("login");
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  function resolveAvatar(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  // Redirect otomatis jika pengguna sudah memiliki sesi aktif (Otomatis Login Bypass)
  useEffect(() => {
    if (authStatus === "authenticated") {
      console.log("User already authenticated, bypassing login screen.");
      if (callbackUrl) {
        if (
          callbackUrl.startsWith("http://") ||
          callbackUrl.startsWith("https://")
        ) {
          window.location.assign(callbackUrl);
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
  }, [authStatus, callbackUrl, router]);

  // Load saved accounts dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sso_saved_accounts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedAccount[];
        if (parsed.length > 0) {
          setTimeout(() => {
            setSavedAccounts(parsed);
            setView("select-account"); // Otomatis ke pilih akun jika ada riwayat
          }, 0);
        }
      } catch (e) {
        console.error("Gagal memuat riwayat akun", e);
      }
    }
  }, []);

  // Tampilkan toast logout jika dikirim dari dashboard
  useEffect(() => {
    const msg = sessionStorage.getItem("logout_message");
    if (msg) {
      sessionStorage.removeItem("logout_message");
      setTimeout(() => toast.success(msg), 100);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verifikasi kredensial ke backend secara langsung terlebih dahulu
      const checkRes = await fetch(`${API_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const checkJson = await checkRes.json();

      if (!checkRes.ok || !checkJson.success) {
        toast.error(checkJson.message || "Email atau password salah");
        setLoading(false);
        return;
      }

      // 2. Simpan profil pengguna & refresh_token ke riwayat masuk lokal (localStorage)
      const loggedUser = checkJson.data.user;
      const refreshToken = checkJson.data.refresh_token;
      const savedRaw = localStorage.getItem("sso_saved_accounts");
      let savedList: SavedAccount[] = savedRaw ? JSON.parse(savedRaw) : [];
      savedList = savedList.filter((acc: SavedAccount) => acc.email !== email); // Hapus duplikat
      savedList.unshift({
        id: loggedUser.id,
        name: loggedUser.name,
        email: loggedUser.email,
        image: loggedUser.image || "",
        role: loggedUser.role || "user",
        refreshToken: refreshToken, // Token rahasia untuk auto-login instan
        lastLogin: new Date().getTime(),
      });
      localStorage.setItem(
        "sso_saved_accounts",
        JSON.stringify(savedList.slice(0, 5)),
      );

      // 3. Panggil NextAuth signIn untuk menyimpan session cookie
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (res?.error) {
        toast.error("Gagal melakukan otentikasi sesi");
      } else {
        toast.success("Login berhasil!");
        if (callbackUrl) {
          if (
            callbackUrl.startsWith("http://") ||
            callbackUrl.startsWith("https://")
          ) {
            window.location.assign(callbackUrl);
          } else {
            router.push(callbackUrl);
            router.refresh();
          }
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi sistem");
      setLoading(false);
    }
  }

  // LOGIN INSTAN TANPA PASSWORD (AUTO-LOGIN KETIKA KARTU PROFIL DIKLIK)
  async function handleSelectAccount(acc: SavedAccount) {
    if (!acc.refreshToken) {
      // Fallback jika token tidak tersedia di lokal
      setEmail(acc.email);
      setPassword("");
      setView("login");
      return;
    }

    setLoading(true);
    try {
      // Mencoba otentikasi NextAuth secara instan menggunakan refresh_token
      const res = await signIn("credentials", {
        email: acc.email,
        token: acc.refreshToken, // Mengirimkan token, bukan password
        redirect: false,
      });

      if (res?.error) {
        // Jika token sudah kedaluwarsa di backend, alihkan ke form password biasa
        console.warn("Sesi token habis, beralih ke password...");
        setEmail(acc.email);
        setPassword("");
        setView("login");
        toast.error("Sesi masuk kedaluwarsa. Silakan ketik password anda.");
      } else {
        // Berhasil login instan secara ajaib!
        toast.success(`Selamat datang kembali, ${acc.name}!`);
        if (callbackUrl) {
          if (
            callbackUrl.startsWith("http://") ||
            callbackUrl.startsWith("https://")
          ) {
            window.location.assign(callbackUrl);
          } else {
            router.push(callbackUrl);
            router.refresh();
          }
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      setEmail(acc.email);
      setPassword("");
      setView("login");
    } finally {
      setLoading(false);
    }
  }

  function handleUseAnotherAccount() {
    setEmail("");
    setPassword("");
    setView("login");
  }

  function handleClearHistory() {
    localStorage.removeItem("sso_saved_accounts");
    setSavedAccounts([]);
    setEmail("");
    setPassword("");
    setView("login");
    toast.success("Riwayat masuk berhasil dibersihkan");
  }

  // TAMPILAN 1: PILIH AKUN (SELECT ACCOUNT)
  if (view === "select-account" && savedAccounts.length > 0) {
    return (
      <Card className="w-full max-w-md mx-auto border border-slate-200/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-1.5 pb-6 text-center">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Pilih Akun
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Pilih salah satu akun Pelajar NU Magetan anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pb-6">
          {/* List Akun */}
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {savedAccounts.map((acc) => {
              const displayAvatar = resolveAvatar(acc.image);
              return (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  disabled={loading}
                  className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-emerald-500/20 active:scale-[0.99] transition-all text-left cursor-pointer group shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500 bg-emerald-50 shadow-inner flex items-center justify-center">
                      {displayAvatar ? (
                        <Image
                          src={displayAvatar}
                          alt={acc.name}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-emerald-700 font-extrabold text-base">
                          {acc.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info User */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-slate-800 font-bold text-sm truncate leading-tight group-hover:text-emerald-700 transition-colors">
                        {acc.name}
                      </p>
                      <Badge className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-1 py-0 rounded text-[9px] font-extrabold uppercase select-none">
                        {acc.role}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-xs truncate mt-0.5 font-medium">
                      {acc.email}
                    </p>
                  </div>

                  {/* Icon Panah / Loading */}
                  <div className="shrink-0">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-slate-100 pt-4 pb-6 px-6">
          <div className="w-full flex items-center justify-between">
            <button
              onClick={handleUseAnotherAccount}
              disabled={loading}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline bg-transparent border-none cursor-pointer disabled:opacity-50"
            >
              Gunakan akun lain
            </button>
            <button
              onClick={handleClearHistory}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus riwayat
            </button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // TAMPILAN 2: INPUT FORM LOGIN
  return (
    <Card className="w-full max-w-md mx-auto border border-slate-200/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-6 text-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
          Masuk ke Akun
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Gunakan akun SSO IPNU-IPPNU Magetan anda
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700 pl-0.5"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 rounded-xl border-slate-200 focus-visible:ring-emerald-500 pl-3"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 rounded-xl border-slate-200 focus-visible:ring-emerald-500 pr-10 pl-3"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
        <Button
          type="submit"
          form="login-form"
          className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk"}
        </Button>

        <div className="w-full flex flex-col items-center gap-2.5 pt-1">
          {savedAccounts.length > 0 && (
            <button
              onClick={() => setView("select-account")}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline bg-transparent border-none cursor-pointer"
            >
              <User className="w-3.5 h-3.5" /> Pilih akun dari daftar
            </button>
          )}

          <p className="text-xs font-semibold text-slate-500 text-center">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
