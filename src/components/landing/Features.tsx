"use client";

import { ShieldCheck, Layers, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Features() {
  return (
    <section id="features" className="py-16 bg-transparent relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Mengapa Menggunakan SSO?
          </h2>
          <p className="text-xs sm:text-sm text-slate-505 leading-relaxed">
            Didesain khusus untuk efisiensi organisasi yang modern, aman, dan berstandar industri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="bg-white/80 border-slate-200/60 rounded-3xl overflow-hidden backdrop-blur-md p-5 sm:p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
            <CardContent className="p-0 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Keamanan Tingkat Tinggi
              </h3>
              <p className="text-slate-555 text-xs sm:text-sm leading-relaxed">
                Protokol otentikasi standar industri OAuth2 (RFC 6749) dengan enkripsi data sensitif AES-256 untuk perlindungan maksimal privasi kader.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-white/80 border-slate-200/60 rounded-3xl overflow-hidden backdrop-blur-md p-5 sm:p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
            <CardContent className="p-0 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Satu Sandi untuk Semua
              </h3>
              <p className="text-slate-555 text-xs sm:text-sm leading-relaxed">
                Cukup ingat satu alamat email dan kata sandi untuk mengakses seluruh sistem administrasi, persuratan, dan basis data tanpa repot.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-white/80 border-slate-200/60 rounded-3xl overflow-hidden backdrop-blur-md p-5 sm:p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
            <CardContent className="p-0 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                 Sinkronisasi Data Profil
              </h3>
              <p className="text-slate-555 text-xs sm:text-sm leading-relaxed">
                Ubah data profil, foto, atau sandi sekali saja di portal SSO, dan semua data tersebut akan langsung ter-update di seluruh aplikasi terkait secara otomatis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
