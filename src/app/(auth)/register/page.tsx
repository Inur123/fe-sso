"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

const PasswordToggle = ({
  show,
  toggle,
}: {
  show: boolean;
  toggle: () => void;
}) => (
  <button
    type="button"
    onClick={toggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirm_password: "",
  });

  const [isSuccess, setIsSuccess] = useState(false);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }
    if (!form.gender) {
      toast.error("Pilih jenis kelamin");
      return;
    }
    if (!form.phone || form.phone.length < 8) {
      toast.error(
        "Nomor HP wajib diisi dengan minimal 8 digit nomor setelah +62",
      );
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        phone: `+62${form.phone}`,
      };
      await api.auth.register(payload);
      setIsSuccess(true);
      toast.success("Registrasi berhasil! Silakan periksa email Anda.");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal membuat akun");
    } finally {
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden p-2">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
            Verifikasi Email Anda
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
            Pendaftaran berhasil! Link verifikasi telah dikirim.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-2 space-y-4">
          <p className="text-sm text-slate-600 dark:text-zinc-300">
            Kami telah mengirimkan link verifikasi akun ke email:
            <br />
            <strong className="text-slate-950 dark:text-zinc-50">
              {form.email}
            </strong>
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed bg-slate-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
            Silakan buka kotak masuk email Anda dan klik tombol verifikasi. Jika
            Anda tidak menemukan email dari kami, mohon periksa folder{" "}
            <strong>Spam</strong> Anda.
          </p>
        </CardContent>
        <CardFooter className="pt-4 pb-6">
          <Button
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 py-5 font-semibold text-sm cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Lanjut ke Halaman Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-5">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Buat Akun Baru
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
          Daftar ke SSO IPNU-IPPNU Magetan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                Nama Lengkap
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Nama lengkap"
                value={form.name}
                onChange={handle}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Alamat email"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* No Telp */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                No WhatsApp / HP <span className="text-destructive">*</span>
              </Label>
              <div className="relative flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 focus-within:ring-1 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-all">
                <span className="inline-flex items-center bg-slate-50 dark:bg-zinc-950/60 px-3 text-sm text-slate-500 dark:text-zinc-400 font-semibold border-r border-slate-200 dark:border-zinc-800 select-none">
                  +62
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="858505..."
                  required
                  value={form.phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("62")) {
                      val = val.substring(2);
                    } else if (val.startsWith("0")) {
                      val = val.substring(1);
                    }
                    setForm({ ...form, phone: val });
                  }}
                  className="rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                />
              </div>
            </div>

            {/* Jenis Kelamin — fullwidth */}
            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                Jenis Kelamin
              </Label>
              <Select
                value={form.gender}
                onValueChange={(val) => setForm({ ...form, gender: val ?? "" })}
              >
                <SelectTrigger
                  id="gender"
                  className="w-full"
                >
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
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
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={handle}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <PasswordToggle
                  show={showPass}
                  toggle={() => setShowPass(!showPass)}
                />
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm_password"
                className="text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={form.confirm_password}
                  onChange={handle}
                  required
                  className="pr-10"
                />
                <PasswordToggle
                  show={showConfirm}
                  toggle={() => setShowConfirm(!showConfirm)}
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-3 pb-6">
        <Button
          type="submit"
          form="register-form"
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 py-5 font-semibold text-sm cursor-pointer"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Daftar
        </Button>
        <p className="text-sm text-slate-500 dark:text-zinc-400 text-center">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
