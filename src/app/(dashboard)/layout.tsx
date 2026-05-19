import { auth } from "@/auth";
import DashboardProviders from "./providers";
import DashboardSidebar from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    // session diteruskan ke SessionProvider agar useSession() di client
    // langsung dapat data — tidak ada fase "loading" → tidak ada flicker
    <DashboardProviders session={session}>
      <DashboardSidebar session={session}>{children}</DashboardSidebar>
    </DashboardProviders>
  );
}
