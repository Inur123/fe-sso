"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Camera, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (file) => {
        if (file) {
          resolve(file);
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      },
      "image/jpeg",
      0.95,
    );
  });
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", gender: "", phone: "" });
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image ?? "");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  useEffect(() => {
    document.title = "Profil Saya | SSO IPNU-IPPNU Magetan";
  }, []);

  useEffect(() => {
    if (!session?.accessToken) return;
    api.user
      .me(session.accessToken)
      .then((res: any) => {
        console.log(
          "🔥 [FRONTEND DEBUG] PROFILE DATA FROM API /v1/user/me:",
          res.data,
        );
        let rawPhone = res.data.phone ?? "";
        if (rawPhone.startsWith("+62")) {
          rawPhone = rawPhone.substring(3);
        } else if (rawPhone.startsWith("62")) {
          rawPhone = rawPhone.substring(2);
        } else if (rawPhone.startsWith("0")) {
          rawPhone = rawPhone.substring(1);
        }

        setProfile(res.data);
        setForm({
          name: res.data.name ?? "",
          gender: res.data.gender ?? "",
          phone: rawPhone,
        });
        setAvatarUrl(res.data.image ?? "");
      })
      .catch((err) => {
        console.error("🔥 [FRONTEND DEBUG] FETCH PROFILE FAILED:", err);
        toast.error("Gagal memuat profil");
      })
      .finally(() => setLoading(false));
  }, [session]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan JPG, PNG, atau WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageToCrop(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropperOpen(true);
    if (e.target) e.target.value = "";
  }

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  async function handleCropSave() {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      setSelectedFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedBlob));
      setCropperOpen(false);
      toast.success(
        "Foto berhasil disesuaikan! Klik 'Simpan Perubahan' di bawah untuk mengupload.",
      );
    } catch (err) {
      console.error(err);
      toast.error("Gagal memotong gambar");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      if (selectedFile) {
        setUploading(true);
        const res: any = await api.user.uploadAvatar(
          session.accessToken,
          selectedFile,
        );
        setAvatarUrl(res.data.image);
        setSelectedFile(null);
        setPreviewUrl("");
        setUploading(false);
      }
      if (!form.phone || form.phone.length < 8) {
        toast.error(
          "Nomor HP wajib diisi dengan minimal 8 digit nomor setelah +62",
        );
        setSaving(false);
        return;
      }

      await api.user.update(session.accessToken, {
        name: form.name,
        gender: form.gender,
        phone: `+62${form.phone}`,
      });
      toast.success("Profil berhasil diperbarui!");
      const updated: any = await api.user.me(session.accessToken);
      setProfile(updated.data);
      setAvatarUrl(updated.data.image ?? "");

      // Beritahu sidebar untuk re-fetch avatar
      window.dispatchEvent(new CustomEvent("avatar-updated"));
    } catch (err: any) {
      toast.error(err.message || "Gagal update profil");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  function resolveAvatarUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  const displayAvatar = previewUrl || resolveAvatarUrl(avatarUrl);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40 rounded" />
          <Skeleton className="h-4 w-56 rounded mt-2" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Kiri skeleton */}
          <div className="rounded-xl border p-6 space-y-4 flex flex-col items-center">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded" />
          </div>
          {/* Kanan skeleton */}
          <div className="rounded-xl border p-6 space-y-6">
            <Skeleton className="h-5 w-28 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-9 w-full rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-9 w-full rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-9 w-full rounded" />
            </div>
            <Skeleton className="h-9 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Profil Saya
        </h1>
        <p className="text-slate-500 dark:text-zinc-400">
          Kelola informasi akun kamu
        </p>
      </div>

      <Separator className="bg-slate-200/60 dark:bg-zinc-800" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Kiri — Info + Avatar */}
        <Card className="flex flex-col h-full border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
              Informasi Dasar
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              Foto dan detail akun kamu
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-6 py-6 pt-2">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-emerald-500/10 shadow-md shadow-emerald-500/5">
                  <AvatarImage src={displayAvatar} />
                  <AvatarFallback className="text-2xl bg-emerald-50 text-emerald-800 font-bold">
                    {form.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="text-center space-y-1">
                <p className="font-bold text-lg text-slate-900 dark:text-zinc-50">
                  {profile?.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  {profile?.email}
                </p>
                <div className="flex gap-2 justify-center pt-1.5 flex-wrap">
                  <Badge className="bg-emerald-50 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-305 border border-emerald-100/60 dark:border-emerald-900/30 font-semibold shadow-none rounded-lg capitalize">
                    {profile?.role}
                  </Badge>
                  {profile?.gender && (
                    <Badge
                      variant="outline"
                      className="text-slate-600 border-slate-200 dark:border-zinc-800 font-semibold shadow-none rounded-lg capitalize"
                    >
                      {profile.gender}
                    </Badge>
                  )}
                </div>
              </div>

              {selectedFile && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-semibold">
                  📎 {selectedFile.name} — akan diupload saat simpan
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:border-emerald-200 cursor-pointer"
              >
                <Camera className="mr-2 h-4 w-4" />
                {selectedFile ? "Ganti File" : "Ganti Foto"}
              </Button>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                JPG, PNG, WebP — maks 2MB
              </p>
            </div>

            {/* Box ID Pengguna yang Premium */}
            <div className="w-full pt-4 border-t border-slate-200/60 dark:border-zinc-800 mt-auto space-y-2">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center">
                ID PENGGUNA
              </p>
              <div className="bg-slate-50 dark:bg-zinc-950 p-2 rounded-xl border border-slate-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
                <code className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono truncate select-all pl-2">
                  {profile?.id}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(profile?.id || "");
                    toast.success("ID Pengguna disalin!");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanan — Form Edit */}
        <Card className="flex flex-col h-full border border-slate-200/80 dark:border-zinc-800/80 shadow-md shadow-slate-100/50 dark:shadow-none bg-white/95 dark:bg-zinc-900/95 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-50">
              Edit Profil
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-zinc-400">
              Perbarui nama dan jenis kelamin
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2 pb-6">
            <form
              onSubmit={handleSave}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                  >
                    Nama Lengkap
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama kamu"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="gender"
                    className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                  >
                    Jenis Kelamin
                  </Label>
                  <Select
                    value={form.gender}
                    onValueChange={(val) =>
                      setForm({ ...form, gender: val ?? "" })
                    }
                  >
                    <SelectTrigger
                      id="gender"
                      className="w-full bg-white dark:bg-zinc-950"
                    >
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
                      <SelectItem value="laki-laki" className="rounded-lg">
                        Laki-laki
                      </SelectItem>
                      <SelectItem value="perempuan" className="rounded-lg">
                        Perempuan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-bold text-slate-700 dark:text-zinc-300"
                  >
                    Nomor WhatsApp / Handphone{" "}
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <div className="relative flex rounded-xl shadow-none overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-1 focus-within:ring-emerald-600 focus-within:border-emerald-600 dark:focus-within:ring-emerald-500 dark:focus-within:border-emerald-500 transition-colors">
                    <span className="inline-flex items-center bg-slate-50 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 px-3 text-sm text-slate-500 dark:text-zinc-400 font-bold select-none">
                      +62
                    </span>
                    <Input
                      id="phone"
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
                      className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9 rounded-l-none"
                      placeholder="85850512xxx"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium pl-1">
                    Masukkan nomor langsung setelah +62 (tanpa angka 0 atau +62
                    di depan)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Email
                  </Label>
                  <Input
                    value={profile?.email}
                    disabled
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium pl-1">
                    Email tidak dapat diubah
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <Separator className="mb-4 bg-slate-200/60 dark:bg-zinc-800" />
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer"
                  disabled={saving}
                >
                  {saving || uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {uploading ? "Mengupload foto..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-zinc-50">
              Sesuaikan Foto Profil
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Geser foto untuk menyesuaikan posisi, gunakan slider di bawah
              untuk memperbesar/memperkecil.
            </p>
          </DialogHeader>
          <div className="relative w-full h-72 bg-slate-100 dark:bg-zinc-950 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-850 mt-4">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                Zoom
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCropperOpen(false)}
                className="rounded-xl border-slate-200 dark:border-zinc-800"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleCropSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                Pangkas & Gunakan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
