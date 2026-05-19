"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, ShieldCheck, Loader2 } from "lucide-react";

const scopeDesc: Record<string, string> = {
  basic_info: "Membaca nama dan email kamu",
  phone: "Membaca nomor telepon kamu",
  email: "Membaca alamat email kamu",
  update_basic_info: "Mengubah nama dan foto profil",
};

function OAuthConsentInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [app, setApp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  const scope = params.get("scope") ?? "basic_info";
  const state = params.get("state") ?? "";

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(window.location.href);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    if (!session?.accessToken || !clientId) return;

    // Ambil info app dari BE
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      },
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setApp(res.data?.app);
        } else {
          setError(res.message ?? "Aplikasi tidak ditemukan");
        }
      })
      .catch(() => setError("Gagal memuat data aplikasi"))
      .finally(() => setLoading(false));
  }, [session, status, clientId]);

  async function handleDecision(allow: boolean) {
    if (!session?.accessToken) return;
    setProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/oauth/authorize/confirm`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            state,
            allow,
          }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyetujui otorisasi");
        setProcessing(false);
        return;
      }

      if (allow && json.data?.redirect_url) {
        window.location.href = json.data.redirect_url;
      } else {
        window.location.href = `${redirectUri}?error=access_denied&state=${state}`;
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
      setProcessing(false);
    }
  }

  if (status === "loading" || loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-2">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-600/30 rounded-full px-4 py-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                SSO IPNU-IPPNU Magetan
              </span>
            </div>
          </div>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-3 text-red-400">
                <XCircle className="w-8 h-8" />
              </div>
              <CardTitle className="text-white text-xl">
                Aplikasi Tidak Dapat Diakses
              </CardTitle>
              <CardDescription className="text-red-400 font-medium mt-1">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-xs text-center leading-relaxed">
                Aplikasi ini tidak dapat dihubungkan ke akun SSO Anda karena alasan di atas. Silakan hubungi pengelola aplikasi atau administrator SSO.
              </p>
              
              <div className="flex gap-3">
                {redirectUri && (
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                    onClick={() => window.location.href = `${redirectUri}?error=access_denied&state=${state}`}
                  >
                    Kembali
                  </Button>
                )}
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/dashboard")}
                >
                  Ke Dashboard SSO
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const scopes = scope.split(" ").filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* SSO branding */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-600/30 rounded-full px-4 py-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">
              SSO IPNU-IPPNU Magetan
            </span>
          </div>
        </div>

        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            {/* App icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center mb-3">
              <span className="text-2xl">{app?.name?.charAt(0) ?? "?"}</span>
            </div>
            <CardTitle className="text-white text-xl">
              {app?.name ?? clientId} meminta akses
            </CardTitle>
            <CardDescription className="text-slate-400">
              ke akun SSO milik{" "}
              <span className="text-white font-medium">
                {session?.user?.name}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Scope list */}
            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                Izin yang diminta
              </p>
              <div className="space-y-2">
                {scopes.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{s}</p>
                      <p className="text-slate-400 text-xs">
                        {scopeDesc[s] ?? "Akses ke data profil"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">
                  {session?.user?.name}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {session?.user?.email}
                </p>
              </div>
              <Badge
                variant="outline"
                className="ml-auto text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 flex-shrink-0"
              >
                {session?.user?.role}
              </Badge>
            </div>

            {/* Disclaimer */}
            <p className="text-slate-500 text-xs text-center">
              Dengan mengklik Izinkan, kamu mengizinkan{" "}
              <span className="text-slate-300">{app?.name ?? clientId}</span>{" "}
              untuk mengakses informasi yang disebutkan di atas.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => handleDecision(false)}
                disabled={processing}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Tolak
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleDecision(true)}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Izinkan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-xs">
          Bukan {session?.user?.name}?{" "}
          <button
            className="text-blue-400 hover:text-blue-300 underline"
            onClick={() => router.push("/dashboard")}
          >
            Ganti akun
          </button>
        </p>
      </div>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      }
    >
      <OAuthConsentInner />
    </Suspense>
  );
}
