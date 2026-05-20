"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  isLoggedIn: boolean;
  handleScrollToSection: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}

export default function Hero({ isLoggedIn, handleScrollToSection }: HeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold select-none shadow-inner shadow-emerald-500/5 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Satu Akun untuk Semua Layanan Digital</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1] text-slate-900">
          Satu Akses Terintegrasi
          <span className="block mt-2 bg-clip-text text-transparent bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-700">
            Pelajar NU Magetan
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed px-2">
          Sistem Single Sign-On (SSO) resmi untuk mempermudah seluruh kader IPNU & IPPNU Kabupaten Magetan mengakses ekosistem digital organisasi dalam sekali login yang aman dan efisien.
        </p>

        {/* Actions - Diubah ke sm:flex-row agar di desktop sejajar Kanan-Kiri bukan Atas-Bawah */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-sm mx-auto sm:max-w-none px-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full sm:w-auto h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-555/20 px-8 gap-2 font-bold transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            )}
          >
            {isLoggedIn ? "Buka Dashboard" : "Masuk ke SSO"}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <button
            onClick={(e) => handleScrollToSection(e, "layanan")}
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 px-8 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer outline-none"
          >
            Ekosistem Aplikasi
          </button>
        </div>
      </div>
    </section>
  );
}
