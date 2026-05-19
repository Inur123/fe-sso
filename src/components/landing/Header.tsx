"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight, UserCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isLoggedIn: boolean;
  handleScrollToTop: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  handleScrollToSection: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}

export default function Header({
  isLoggedIn,
  handleScrollToTop,
  handleScrollToSection,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 
        PREMIUM FROSTED GLASS HEADER (ZERO FLICKER):
        Header diatur selalu berlatar belakang Frosted Glass putih transparan mewah sejak render pertama (SSR & Client).
        Ini 100% membuang visual bug kedipan transparan / overlap teks menu dengan elemen di belakangnya saat di-refresh!
      */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md py-3 shadow-md shadow-slate-200/30 border-b border-slate-200/20 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between relative h-10 sm:h-12">
          {/* Logo Brand dengan smooth scroll ke atas */}
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="flex items-center gap-3 group shrink-0 z-10"
          >
            {/* Logo web muncul langsung secara cerah, bagus, simpel & rapi */}
            <img
              src="/logo-sso.png"
              alt="Logo SSO"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm"
            />
            <div className="hidden xs:block">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">
                SSO Pelajar NU
              </span>
              <span className="block text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-[-2px]">
                Kab. Magetan
              </span>
            </div>
          </Link>

          {/* 
            PERFECTLY CENTERED MENU:
            Diletakkan secara absolute di tengah-tengah container (1/2 viewport width)
            Menggunakan <button> alih-alih <a> untuk mencegah browser status bar tooltip muncul di pojok kiri bawah layar!
          */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 absolute left-1/2 -translate-x-1/2 h-full top-0">
            <button
              onClick={handleScrollToTop}
              className="hover:text-emerald-600 transition-colors cursor-pointer border-none bg-transparent outline-none font-semibold text-sm"
            >
              Beranda
            </button>
            <button
              onClick={(e) => handleScrollToSection(e, "features")}
              className="hover:text-emerald-600 transition-colors cursor-pointer border-none bg-transparent outline-none font-semibold text-sm"
            >
              Fitur Utama
            </button>
            <button
              onClick={(e) => handleScrollToSection(e, "layanan")}
              className="hover:text-emerald-600 transition-colors cursor-pointer border-none bg-transparent outline-none font-semibold text-sm"
            >
              Ekosistem
            </button>
            <button
              onClick={(e) => handleScrollToSection(e, "keamanan")}
              className="hover:text-emerald-600 transition-colors cursor-pointer border-none bg-transparent outline-none font-semibold text-sm"
            >
              Keamanan
            </button>
          </nav>

          {/* 
            ZERO-FLICKER STATIC-FIRST AUTH BUTTON & HAMBURGER:
            Halaman awal langsung mengarah ke /login (jika belum masuk) agar url bersih
            tanpa callbackUrl parameter yang panjang.
          */}
          <div className="flex items-center gap-2.5 sm:gap-3 z-10">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "hidden md:inline-flex bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/10 px-4 sm:px-5 gap-2 cursor-pointer font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm h-9 sm:h-10"
                )}
              >
                <UserCheck className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "hidden md:inline-flex bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/10 px-4 sm:px-5 gap-2 cursor-pointer font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm h-9 sm:h-10"
                )}
              >
                Masuk SSO
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {/* Hamburger Button untuk Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/80 border border-slate-200/80 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 
        Mobile Navigation Drawer (LIGHT THEME):
        Gelas glassmorphism mewah yang meluncur turun - Disetarakan ke max-w-5xl bounds
        Menggunakan <button> agar bersih dari status bar preview url browser
      */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[64px] sm:top-[80px] z-40 bg-white/95 backdrop-blur-lg flex flex-col p-6 space-y-5 border-b border-slate-200 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="max-w-5xl mx-auto w-full flex flex-col space-y-5">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={(e) => {
                  handleScrollToTop(e);
                  setMobileMenuOpen(false);
                }}
                className="text-base font-semibold text-slate-700 hover:text-emerald-600 transition-colors py-3 border-b border-slate-100 text-center w-full border-none bg-transparent outline-none cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={(e) => {
                  handleScrollToSection(e, "features");
                  setMobileMenuOpen(false);
                }}
                className="text-base font-semibold text-slate-700 hover:text-emerald-600 transition-colors py-3 border-b border-slate-100 text-center w-full border-none bg-transparent outline-none cursor-pointer"
              >
                Fitur Utama
              </button>
              <button
                onClick={(e) => {
                  handleScrollToSection(e, "layanan");
                  setMobileMenuOpen(false);
                }}
                className="text-base font-semibold text-slate-700 hover:text-emerald-600 transition-colors py-3 border-b border-slate-100 text-center w-full border-none bg-transparent outline-none cursor-pointer"
              >
                Ekosistem Layanan
              </button>
              <button
                onClick={(e) => {
                  handleScrollToSection(e, "keamanan");
                  setMobileMenuOpen(false);
                }}
                className="text-base font-semibold text-slate-700 hover:text-emerald-600 transition-colors py-3 text-center w-full border-none bg-transparent outline-none cursor-pointer"
              >
                Keamanan Platform
              </button>
            </nav>

            {/* Tombol Login khusus di dalam mobile drawer */}
            <div className="pt-2 border-t border-slate-100">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-md shadow-emerald-650/10 cursor-pointer"
                  )}
                >
                  <UserCheck className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-md shadow-emerald-655/10 cursor-pointer"
                  )}
                >
                  Masuk SSO
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
