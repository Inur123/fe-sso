"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID Pengguna disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex max-w-full items-center gap-1.5 font-mono bg-slate-50 dark:bg-zinc-950/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-350 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-zinc-800 transition-colors cursor-pointer text-[11px] font-medium"
      title="Salin ID"
    >
      <span className="truncate max-w-[140px] sm:max-w-none">{id}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-650 dark:text-emerald-450" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-slate-400" />
      )}
    </button>
  );
}
