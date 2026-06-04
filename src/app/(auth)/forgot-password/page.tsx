"use client";

import { useState } from "react";
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
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.auth.forgotPassword({ email });
      setSubmitted(true);
      toast.success("Email pemulihan password berhasil dikirim!");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memproses permintaan reset password");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto border border-slate-200/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-1.5 pb-6 text-center">
          <div className="flex justify-center py-2">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-bounce" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Email Terkirim
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Kami telah mengirimkan instruksi pemulihan kata sandi
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-6">
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Silakan periksa kotak masuk email <strong className="text-slate-900">{email}</strong> Anda. Klik tautan di dalam email tersebut untuk mereset password Anda.
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

  return (
    <Card className="w-full max-w-md mx-auto border border-slate-200/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-6 text-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
          Lupa Password
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Masukkan email akun Anda untuk menerima tautan pemulihan
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <form id="forgot-password-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700 pl-0.5"
            >
              Email Terdaftar
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-xl border-slate-200 focus-visible:ring-emerald-500 pl-10 pr-3"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
        <Button
          type="submit"
          form="forgot-password-form"
          className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Kirim Link Pemulihan"
          )}
        </Button>

        <div className="w-full flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
