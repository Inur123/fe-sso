"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAProps {
  isLoggedIn: boolean;
}

export default function CTA({ isLoggedIn }: CTAProps) {
  return (
    <section className="py-16 sm:py-20 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Siap Memasuki Ekosistem Digital?
        </h2>
        <p className="max-w-lg mx-auto text-slate-555 text-xs sm:text-sm md:text-base font-medium">
          Masuk sekarang dan kelola surat organisasi di Laci-v3 atau kelola data keanggotaan Kakak di OSB Magetan dengan mudah.
        </p>
        <div className="pt-4 px-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full sm:w-auto h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 px-8 gap-2 font-bold transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            )}
          >
            {isLoggedIn ? "Kembali ke Dashboard" : "Masuk SSO Sekarang"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
