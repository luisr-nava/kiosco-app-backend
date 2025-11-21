"use client";

import { PrivateRouteGuard } from "@/components/guards/private-route-guard";
import { StoreSetupGuard } from "@/components/guards/store-setup-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { UserMenu } from "@/app/(auth)/components/user-menu";
import { ModeToggle } from "@/components/theme/mode-toggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSetupPage = pathname === "/dashboard/setup";

  return (
    <PrivateRouteGuard>
      <StoreSetupGuard>
        {isSetupPage ? (
          // Layout simple para la página de setup
          <div className="min-h-screen">
            <header className="border-b bg-card">
              <div className="flex items-center justify-between gap-4 p-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Image
                    src="/kioscoapp.png"
                    alt="Logo de Kiosco App"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-lg object-contain shadow-sm"
                  />
                  <div className="leading-tight">
                    <span className="font-semibold">Kiosco App</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">Panel</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                  <UserMenu />
                  <MobileSidebar />
                </div>
              </div>
            </header>
            <main>{children}</main>
          </div>
        ) : (
          // Layout normal con sidebar para otras páginas
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <header className="border-b bg-card">
                <div className="flex items-center justify-between gap-4 p-4">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <Image
                      src="/kioscoapp.png"
                      alt="Logo de Kiosco App"
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-lg object-contain shadow-sm"
                    />
                    <div className="leading-tight">
                      <span className="font-semibold">Kiosco App</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">Panel</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <ModeToggle />
                    <UserMenu />
                    <MobileSidebar />
                  </div>
                </div>
              </header>
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        )}
      </StoreSetupGuard>
    </PrivateRouteGuard>
  );
}
