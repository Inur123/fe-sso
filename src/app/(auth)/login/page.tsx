"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Loader2, Eye, EyeOff } from "lucide-react";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  console.log("LoginInner component render, callbackUrl is:", callbackUrl);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

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
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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

      // 2. Jika sukses verifikasi di backend, panggil NextAuth signIn untuk menyimpan session
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);
      console.log("NextAuth signIn response:", res);

      if (res?.error) {
        toast.error("Gagal melakukan otentikasi sesi");
      } else {
        toast.success("Login berhasil!");
        console.log("Redirecting... callbackUrl is:", callbackUrl);
        if (callbackUrl) {
          if (callbackUrl.startsWith("http://") || callbackUrl.startsWith("https://")) {
            console.log("Executing window.location.href redirect to:", callbackUrl);
            window.location.href = callbackUrl;
          } else {
            console.log("Executing router.push redirect to:", callbackUrl);
            router.push(callbackUrl);
            router.refresh();
          }
        } else {
          console.log("No callbackUrl found, redirecting to /dashboard");
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan koneksi sistem");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Masuk ke Akun
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
          Gunakan akun SSO IPNU-IPPNU Magetan kamu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-zinc-300"
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
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
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
      <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
        <Button
          type="submit"
          form="login-form"
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 py-5 font-semibold text-sm cursor-pointer"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Masuk
        </Button>
        <p className="text-sm text-slate-500 dark:text-zinc-400 text-center">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            Daftar sekarang
          </Link>
        </p>
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
