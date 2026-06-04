"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Image from "next/image";

interface DashboardSession {
  accessToken?: string;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  AppWindow,
  User,
  LogOut,
  ShieldCheck,
  Users,
  KeyRound,
  MoreHorizontal,
  Lock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apps", label: "Aplikasi Saya", icon: AppWindow },
  { href: "/sessions", label: "Sesi Aktif", icon: KeyRound },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/security", label: "Keamanan", icon: Lock },
];

const adminItems = [
  { href: "/admin/apps", label: "Kelola Aplikasi", icon: ShieldCheck },
  { href: "/admin/users", label: "Kelola User", icon: Users },
];

interface DashboardSidebarProps {
  children: React.ReactNode;
  session: DashboardSession | null;
}

export default function DashboardSidebar({
  children,
  session: initialSession,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: clientSession } = useSession();
  
  // Menggunakan clientSession (NextAuth hook) agar reaktif 100% real-time,
  // dengan fallback ke initialSession (server-side prop) untuk menghindari flicker/delay.
  const session = clientSession || initialSession;

  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image ?? "");
  const [avatarKey, setAvatarKey] = useState(0);
  const { isMobile, setOpenMobile } = useSidebar();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  function resolveAvatar(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  const handleNavigate = (href: string) => {
    router.push(href);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  useEffect(() => {
    if (!session?.accessToken) return;
    api.user
      .me(session.accessToken)
      .then((res) => {
        const response = res as { data: { image?: string | null } };
        setAvatarUrl(response.data.image ?? "");
      })
      .catch(() => {});
  }, [session, avatarKey]);

  useEffect(() => {
    const handler = () => setAvatarKey((k) => k + 1);
    window.addEventListener("avatar-updated", handler);
    return () => window.removeEventListener("avatar-updated", handler);
  }, []);

  const displayAvatar =
    resolveAvatar(avatarUrl) || resolveAvatar(session?.user?.image ?? "") || "";
  const isAdmin = session?.user?.role === "superadmin";

  async function handleLogout() {
    sessionStorage.setItem(
      "logout_message",
      "Sampai jumpa! Kamu berhasil keluar.",
    );
    await signOut({ redirect: false });
    router.push("/login");
  }

  return (
    <>
      <Sidebar>
        {/* Header */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => handleNavigate("/dashboard")}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                  <Image
                    src="/logo-sso.png"
                    alt="SSO Magetan"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SSO Magetan</span>
                  <span className="truncate text-xs text-muted-foreground">
                    pelajarnumagetan.or.id
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          "transition-all duration-200",
                          active
                            ? "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700! dark:text-emerald-400! font-semibold"
                            : "hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            active
                              ? "text-emerald-600! dark:text-emerald-400!"
                              : "text-slate-500 dark:text-zinc-400",
                          )}
                        />
                        <span
                          className={cn(
                            active
                              ? "text-emerald-700! dark:text-emerald-400! font-semibold"
                              : "text-slate-700 dark:text-zinc-300",
                          )}
                        >
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems
                    .filter(
                      (item) =>
                        session?.user?.role === "superadmin" ||
                        item.href !== "/admin/apps",
                    )
                    .map((item) => {
                      const active = pathname.startsWith(item.href);
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            isActive={active}
                            onClick={() => handleNavigate(item.href)}
                            className={cn(
                              "transition-all duration-200",
                              active
                                ? "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700! dark:text-emerald-400! font-semibold"
                                : "hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300",
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-4 w-4",
                                active
                                  ? "text-emerald-600! dark:text-emerald-400!"
                                  : "text-slate-500 dark:text-zinc-400",
                              )}
                            />
                            <span
                              className={cn(
                                active
                                  ? "text-emerald-700! dark:text-emerald-400! font-semibold"
                                  : "text-slate-700 dark:text-zinc-300",
                              )}
                            >
                              {item.label}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-full"
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                    >
                      <div className="size-8 rounded-lg overflow-hidden bg-sidebar-primary/10 flex items-center justify-center font-medium text-xs border border-sidebar-border">
                        {displayAvatar ? (
                          <Image
                            src={displayAvatar}
                            alt={session?.user?.name ?? "User avatar"}
                            width={32}
                            height={32}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>
                            {session?.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {session?.user?.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {session?.user?.email}
                        </span>
                      </div>
                      <MoreHorizontal className="ml-auto size-4" />
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent
                  side="right"
                  align="end"
                  className="w-56 mb-1"
                >
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                    <div className="size-8 rounded-lg overflow-hidden bg-sidebar-primary/10 flex items-center justify-center font-medium text-xs border border-sidebar-border">
                      {displayAvatar ? (
                        <Image
                          src={displayAvatar}
                          alt={session?.user?.name ?? "User avatar"}
                          width={32}
                          height={32}
                          className="size-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>
                          {session?.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user?.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main content */}
      <main className="flex-1 h-svh overflow-y-auto relative bg-slate-50/30 dark:bg-zinc-950/20">
        {/* Subtle ambient decorative glows */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-emerald-500/4 dark:bg-emerald-500/7 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/3 dark:bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="sticky top-0 z-30 flex items-center gap-2 border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 py-2.5">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <Badge
            variant="outline"
            className="capitalize border-emerald-500/20 text-emerald-800 bg-emerald-50/50 dark:text-emerald-305 dark:bg-emerald-950/20 font-medium"
          >
            {session?.user?.role ?? "user"}
          </Badge>
        </div>
        <div className="relative p-4 sm:p-6">{children}</div>
      </main>
    </>
  );
}
