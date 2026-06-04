"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

export default function SecurityPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;

    if (!form.oldPassword) {
      toast.error("Password lama wajib diisi");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    setSaving(true);
    try {
      await api.user.changePassword(session.accessToken, {
        old_password: form.oldPassword,
        new_password: form.newPassword,
      });

      toast.success("Password berhasil diperbarui!");
      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memperbarui password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Keamanan Akun
        </h1>
        <p className="text-slate-500 dark:text-zinc-400">
          Kelola kredensial dan kata sandi akun kamu
        </p>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      <Card className="border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
            Ubah Password
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
            Pastikan password baru kamu kuat dan tidak mudah ditebak
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="oldPassword"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  Password Lama
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={form.oldPassword}
                    onChange={(e) =>
                      setForm({ ...form, oldPassword: e.target.value })
                    }
                    placeholder="Masukkan password lama"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="newPassword"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({ ...form, newPassword: e.target.value })
                    }
                    placeholder="Minimal 8 karakter"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  Konfirmasi Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    placeholder="Ulangi password baru"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Separator className="mb-4 bg-slate-200/60 dark:bg-zinc-800" />
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer transition-all active:scale-[0.99]"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Perbarui Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
