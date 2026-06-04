"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">(
    token ? "form" : "error"
  );
  const message = token ? "" : "Token reset password tidak valid atau tidak ditemukan.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword({
        token,
        password,
        confirm_password: confirmPassword,
      });

      setStatus("success");
      toast.success("Password Anda berhasil diatur ulang!");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal mereset password");
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md mx-auto border border-slate-200/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-1.5 pb-6 text-center">
          <div className="flex justify-center py-2">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-bounce" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Reset Password Sukses!
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Kata sandi akun Anda berhasil diperbarui
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-6">
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Silakan kembali ke halaman masuk menggunakan password baru Anda.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-all"
            )}
          >
            Kembali ke Login
          </Link>
        </CardFooter>
      </Card>
    ); 
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto border border-slate-200/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-1.5 pb-6 text-center">
          <div className="flex justify-center py-2">
            <XCircle className="h-12 w-12 text-red-500 animate-pulse" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-red-600">
            Link Tidak Valid
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Token reset password kadaluarsa atau salah
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-6">
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            {message || "Silakan ajukan permintaan reset password kembali dari halaman masuk."}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
          <Link
            href="/forgot-password"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full h-10 bg-emerald-750 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-all"
            )}
          >
            Ajukan Reset Kembali
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-slate-200/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-6 text-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
          Buat Password Baru
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Masukkan password baru untuk mengamankan akun Anda
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700 pl-0.5"
            >
              Password Baru
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 rounded-xl border-slate-200 focus-visible:ring-emerald-500 pl-3 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-slate-700 pl-0.5"
            >
              Ulangi Password Baru
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Masukkan ulang password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 rounded-xl border-slate-200 focus-visible:ring-emerald-500 pl-3 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
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
          form="reset-password-form"
          className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Perbarui Password"
          )}
        </Button>

        <div className="w-full flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Batal dan Kembali
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center py-4">
              <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
            </div>
            <CardTitle>Memuat Halaman</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
