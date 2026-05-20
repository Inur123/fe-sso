import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50/50 dark:bg-zinc-950 px-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Micro dot grid pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-size-[24px_24px] opacity-70 pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10 py-8">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo-sso.png"
              alt="SSO IPNU-IPPNU Magetan Logo"
              width={68}
              height={68}
              className="w-[85%] h-[85%] object-contain"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-emerald-800 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
              SSO IPNU-IPPNU Magetan
            </h1>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 tracking-wider uppercase">
              sso.pelajarnumagetan.or.id
            </p>
          </div>
        </div>

        {children}

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} IPNU-IPPNU Magetan. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
