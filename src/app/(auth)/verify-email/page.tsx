"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Sedang memverifikasi email Anda...");
  const [token, setToken] = useState<string | null>(null);
  const [hasInitiated, setHasInitiated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("token"));
    }
  }, []);

  useEffect(() => {
    if (token === null && typeof window !== "undefined") {
      // Tunggu hydration selesai membaca window.location.search
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak valid atau tidak ditemukan.");
      return;
    }

    if (hasInitiated) return;
    setHasInitiated(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    fetch(`${API_URL}/v1/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok && json.success) {
          setStatus("success");
          setMessage(
            "Email Anda berhasil diverifikasi! Sekarang Anda dapat login.",
          );
          toast.success("Verifikasi email berhasil!");
        } else {
          setStatus("error");
          setMessage(json.message || "Gagal memverifikasi email Anda.");
          toast.error(json.message || "Verifikasi email gagal.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Terjadi kesalahan koneksi sistem.");
        toast.error("Kesalahan jaringan.");
      });
  }, [token, hasInitiated]);

  return (
    <Card className="border-emerald-500/20 shadow-md">
      <CardHeader className="text-center">
        {status === "loading" && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
          </div>
        )}
        {status === "success" && (
          <div className="flex justify-center py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
          </div>
        )}
        {status === "error" && (
          <div className="flex justify-center py-4">
            <XCircle className="h-12 w-12 text-destructive animate-pulse" />
          </div>
        )}
        <CardTitle className="mt-2 text-2xl font-bold tracking-tight">
          {status === "loading" && "Memproses Verifikasi"}
          {status === "success" && "Verifikasi Sukses!"}
          {status === "error" && "Verifikasi Gagal"}
        </CardTitle>
        <CardDescription className="mt-1">
          Sistem Single Sign-On IPNU-IPPNU Magetan
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-2">
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-4">
        {status !== "loading" && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push("/login")}
          >
            Kembali ke Login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center py-4">
              <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
            </div>
            <CardTitle>Memuat Halaman</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
