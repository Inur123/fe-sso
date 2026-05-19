"use client";

export default function Footer() {
  return (
    /* Footer - Diubah lebar ke max-w-7xl, ditambah margin top mt-20 sm:mt-32 & pt-14 pb-6 agar teks footer sejajar tinggi sempurna dengan arrow button di kanan bawah */
    <footer className="mt-20 sm:mt-32 pt-14 pb-6 bg-transparent relative z-10 border-t border-slate-200/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 text-center md:text-left">
        <p>© 2026 PC IPNU IPPNU Kabupaten Magetan. Hak Cipta Dilindungi.</p>
        <p>
          Developed with 💚 by{" "}
          <span className="text-slate-600 hover:text-emerald-600 transition-colors">
            Developer PC IPNU Magetan
          </span>
        </p>
      </div>
    </footer>
  );
}
