"use client";

import { PrivateRouteGuard } from "@/components/guards/private-route-guard";
import { StoreSetupGuard } from "@/components/guards/store-setup-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { UserMenu } from "@/app/(auth)/components/user-menu";
import { menuItems } from "@/components/layout/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSetupPage = pathname === "/dashboard/setup";
  const isOnSales = pathname.startsWith("/dashboard/sales");
  const sellButtonClasses = cn(
    "transition shadow-sm",
    !isOnSales &&
      "animate-pulse ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
  );
  const currentMenu =
    menuItems.reduce<
      (typeof menuItems)[number] | null
    >((best, item) => {
      const matches =
        pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (!matches) return best;
      if (!best) return item;
      return item.href.length > best.href.length ? item : best;
    }, null) || null;
  const pageDescription = currentMenu?.description || "Panel de administración.";

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
                </Link>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard/sales">
                    <Button size="sm" className={sellButtonClasses}>
                      Vender
                    </Button>
                  </Link>
                  <UserMenu />
                  <MobileSidebar />
                </div>
              </div>
            </header>
            <main>{children}</main>
          </div>
        ) : (
          // Layout normal con sidebar para otras páginas
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-16 flex flex-col h-screen">
              <header className="sticky top-0 z-20 border-b bg-card">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-3">
                      <Image
                        src="/kioscoapp.png"
                        alt="Logo de Kiosco App"
                        width={36}
                        height={36}
                    className="h-9 w-9 rounded-lg object-contain shadow-sm"
                  />
                </Link>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold leading-tight">
                        {currentMenu?.label || "Panel"}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {pageDescription || "Panel de administración."}
                      </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard/sales">
                    <Button size="sm" className={sellButtonClasses}>
                      Vender
                    </Button>
                  </Link>
                  <UserMenu />
                  <MobileSidebar />
                </div>
              </div>
            </header>
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        )}
      </StoreSetupGuard>
    </PrivateRouteGuard>
  );
}
