import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/components/providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SSO IPNU-IPPNU Magetan",
    template: "%s | SSO IPNU-IPPNU Magetan",
  },
  description:
    "Single Sign-On resmi IPNU-IPPNU Magetan — sso.pelajarnumagetan.or.id",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={geist.className}>
        <AppProviders>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" />
          </TooltipProvider>
        </AppProviders>
      </body>
    </html>
  );
}
