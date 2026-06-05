"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface OauthApp {
  name: string;
}
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ShieldCheck, Loader2 } from "lucide-react";

function OAuthConsentInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [app, setApp] = useState<OauthApp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image ?? "");

  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  const scope = params.get("scope") ?? "basic_info";
  const state = params.get("state") ?? "";

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  function resolveAvatar(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  // Load fresh avatar from BE
  useEffect(() => {
    if (!session?.accessToken) return;
    fetch(`${API_URL}/v1/user/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const response = res as { success: boolean; data?: { image: string } };
        if (response.success && response.data?.image) {
          setAvatarUrl(response.data.image);
        }
      })
      .catch(() => {});
  }, [session, API_URL]);

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(window.location.href);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    if (!session?.accessToken || !clientId) return;

    // Ambil info app dari BE
    fetch(
      `${API_URL}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      },
    )
      .then((r) => r.json())
      .then((res) => {
        const response = res as {
          success: boolean;
          data?: { app: OauthApp };
          message?: string;
        };
        if (response.success) {
          setApp(response.data?.app ?? null);
        } else {
          setError(response.message ?? "Aplikasi tidak ditemukan");
        }
      })
      .catch(() => setError("Gagal memuat data aplikasi"))
      .finally(() => setLoading(false));
  }, [session, status, clientId, API_URL, redirectUri, scope, state, router]);

  async function handleDecision(allow: boolean) {
    if (!session?.accessToken) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/oauth/authorize/confirm`, {
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
      });
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
    } catch {
      toast.error("Terjadi kesalahan koneksi");
      setProcessing(false);
    }
  }

  // Display avatar with fallback
  const displayAvatar =
    resolveAvatar(avatarUrl) || resolveAvatar(session?.user?.image ?? "") || "";

  if (status === "loading" || loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );

  if (error) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 overflow-x-hidden font-sans selection:bg-emerald-100 selection:text-slate-900">
        {/* Canvas background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-75 pointer-events-none z-0" />

        {/* Pastel mesh glowing orbs */}
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-200/35 blur-[120px] pointer-events-none z-0 animate-pulse" />
        <div className="absolute bottom-[5%] right-[10%] w-[30%] h-[30%] rounded-full bg-teal-200/20 blur-[100px] pointer-events-none z-0" />

        <div className="w-full max-w-md space-y-5 relative z-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold select-none shadow-inner shadow-emerald-500/5 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SSO Pelajar NU Magetan</span>
            </div>
          </div>

          <Card className="bg-white/80 border-slate-200/60 rounded-[32px] overflow-hidden backdrop-blur-md shadow-xl shadow-slate-200/30 p-6 space-y-6">
            <div className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500">
                <XCircle className="w-9 h-9" />
              </div>
              <h3 className="text-slate-900 text-lg font-bold">
                Aplikasi Tidak Dapat Diakses
              </h3>
              <p className="text-red-550 text-sm font-semibold mt-1">{error}</p>
            </div>

            <CardContent className="p-0 space-y-6">
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                Aplikasi ini tidak dapat dihubungkan ke akun SSO Anda karena
                alasan di atas. Silakan hubungi pengelola aplikasi atau
                administrator SSO.
              </p>

              <div className="flex gap-3">
                {redirectUri && (
                  <Button
                    variant="outline"
                    className="flex-1 h-11 border-slate-200 hover:border-slate-300 bg-white/80 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-2xl font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() =>
                      (window.location.href = `${redirectUri}?error=access_denied&state=${state}`)
                    }
                  >
                    Kembali
                  </Button>
                )}
                <Button
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-md shadow-emerald-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 overflow-x-hidden font-sans selection:bg-emerald-100 selection:text-slate-900">
      {/* Canvas background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-75 pointer-events-none z-0" />

      {/* Ambient glowing pastel mesh orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-200/35 blur-[120px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-[25%] right-[-10%] w-[35%] h-[35%] rounded-full bg-teal-200/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-200/20 blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* SSO branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold select-none shadow-inner shadow-emerald-500/5 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SSO Pelajar NU Magetan</span>
          </div>

          <div className="flex flex-col items-center">
            {/* Brand Logo */}
            <Image
              src="/logo-sso.png"
              alt="Logo SSO"
              width={56}
              height={56}
              className="h-14 w-14 object-contain filter drop-shadow-sm mb-2"
            />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Otorisasi Akses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 px-4 leading-relaxed">
              Aplikasi{" "}
              <span className="font-bold text-emerald-600">
                {app?.name ?? clientId}
              </span>{" "}
              meminta izin untuk terhubung dengan akun SSO anda.
            </p>
          </div>
        </div>

        <Card className="bg-white/80 border-slate-200/60 rounded-[32px] overflow-hidden backdrop-blur-md shadow-xl shadow-slate-200/30 p-6 space-y-6">
          {/* Circular profile avatar, name, and email just like PBNU */}
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="relative group">
              {/* Glowing soft backdrop behind avatar */}
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-sm group-hover:scale-105 transition-transform duration-300" />

              <div className="relative w-24 h-24 rounded-full overflow-hidden border-[3px] border-emerald-500 bg-emerald-50 shadow-inner flex items-center justify-center">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt={session?.user?.name ?? "User avatar"}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl font-bold text-emerald-600">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {session?.user?.name}
                </h3>
                <Badge className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-2.5 py-0.5 rounded-full select-none text-[10px] font-bold uppercase tracking-wider">
                  {session?.user?.role ?? "Kader"}
                </Badge>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <CardContent className="p-0 space-y-6">
            {/* Disclaimer */}
            <p className="text-slate-400 text-[11px] text-center leading-relaxed px-2">
              Dengan mengizinkan, data profil dasar anda akan dibagikan ke
              aplikasi{" "}
              <span className="font-semibold text-slate-700">
                {app?.name ?? clientId}
              </span>{" "}
              secara aman.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 border-slate-200 hover:border-slate-300 bg-white/80 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-2xl font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                onClick={() => handleDecision(false)}
                disabled={processing}
              >
                <XCircle className="w-4.5 h-4.5 mr-1.5 text-slate-500" /> Tolak
              </Button>
              <Button
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-md shadow-emerald-600/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                onClick={() => handleDecision(true)}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 mr-1.5 text-white" />{" "}
                    Izinkan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-xs font-semibold">
          Bukan {session?.user?.name}?{" "}
          <button
            className="text-emerald-600 hover:text-emerald-500 underline font-semibold bg-transparent border-none cursor-pointer outline-none"
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
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <OAuthConsentInner />
    </Suspense>
  );
}
