"use client";

import { FileText, Database, ExternalLink } from "lucide-react";

export default function Ecosystem() {
  return (
    <section id="layanan" className="py-20 bg-transparent relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Ekosistem Aplikasi Terintegrasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-505 leading-relaxed">
            SSO IPNU-IPPNU Magetan telah terhubung penuh dengan berbagai platform andalan untuk menggerakkan digitalisasi organisasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* App 1 - Laci v3 */}
          <div className="bg-white/80 border border-slate-200/60 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-6 hover:bg-white/95 hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden group backdrop-blur-md shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none transition-all group-hover:scale-110" />
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Laci v3 Magetan</h3>
                <span className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full select-none uppercase tracking-wider">
                  Sistem Persuratan
                </span>
              </div>
              <p className="text-slate-550 text-xs sm:text-sm leading-relaxed">
                Aplikasi pengarsipan digital dan pengelolaan persuratan tingkat PC, PAC, PR, hingga PK IPNU-IPPNU secara modern, paperless, terorganisir, dan cepat.
              </p>
              <div className="pt-1.5">
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 hover:underline"
                >
                  Buka Laci v3
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* App 2 - OSB */}
          <div className="bg-white/80 border border-slate-200/60 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-6 hover:bg-white/95 hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden group backdrop-blur-md shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-[100px] pointer-events-none transition-all group-hover:scale-110" />
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
              <Database className="h-7 w-7" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">OSB (Basisdata Kader)</h3>
                <span className="text-[9px] font-bold bg-teal-500/10 border border-teal-500/20 text-teal-600 px-2 py-0.5 rounded-full select-none uppercase tracking-wider">
                  Database
                </span>
              </div>
              <p className="text-slate-555 text-xs sm:text-sm leading-relaxed">
                Open System Basisdata terintegrasi untuk registrasi kader, pengelolaan data keanggotaan secara real-time, statistik kepengurusan, dan KTA digital.
              </p>
              <div className="pt-1.5">
                <a
                  href="https://osb.pelajarnumagetan.or.id"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-500 hover:underline"
                >
                  Buka OSB
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
