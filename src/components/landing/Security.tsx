"use client";

import { Lock } from "lucide-react";

export default function Security() {
  return (
    <section id="keamanan" className="py-20 bg-transparent relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-tr from-white to-slate-50/50 border border-slate-200/80 rounded-[36px] p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-10 shadow-lg shadow-slate-100 relative overflow-hidden backdrop-blur-md">
          {/* Glowing spot */}
          <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-emerald-500/5 blur-[50px] pointer-events-none" />

          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>

          <div className="space-y-4 text-center md:text-left flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Standar Otorisasi & Privasi Aman
            </h3>
            <p className="text-slate-550 text-xs sm:text-sm md:text-base leading-relaxed">
              Platform ini dibangun sepenuhnya di atas protokol otentikasi
              **OAuth 2.0 standar industri**, yang menjamin kredensial password
              anda tidak akan pernah dibagikan ke aplikasi klien lainnya.
              Aplikasi ekosistem hanya memperoleh otorisasi akses data publik
              yang sah setelah anda memberikan persetujuan eksplisit.
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5 justify-center md:justify-start">
              <span className="text-[9px] sm:text-[10px] font-bold bg-slate-100 border border-slate-200/60 text-slate-600 px-3 py-1 rounded-full uppercase select-none">
                OAuth 2.0 (RFC 6749)
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold bg-slate-100 border border-slate-200/60 text-slate-600 px-3 py-1 rounded-full uppercase select-none">
                AES-256 Encryption
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold bg-slate-100 border border-slate-200/60 text-slate-600 px-3 py-1 rounded-full uppercase select-none">
                Secure Sessions
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
