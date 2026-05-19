"use client";

import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  scrolled: boolean;
  handleScrollToTop: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ScrollToTop({ scrolled, handleScrollToTop }: ScrollToTopProps) {
  if (!scrolled) return null;

  return (
    <button
      onClick={handleScrollToTop}
      className="fixed bottom-6 right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 transition-all hover:scale-110 active:scale-95 duration-300 border border-emerald-500/20 cursor-pointer outline-none animate-in fade-in slide-in-from-bottom-4"
      aria-label="Kembali ke atas"
    >
      <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}
