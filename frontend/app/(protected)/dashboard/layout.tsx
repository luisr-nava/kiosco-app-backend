"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { menuItems } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/features/auth/components";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isOnSales = pathname.startsWith("/dashboard/sales");
  const sellButtonClasses = cn(
    "transition shadow-sm",
    !isOnSales && "animate-pulse ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
  );
  const currentMenu =
    menuItems.reduce<(typeof menuItems)[number] | null>((best, item) => {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (!matches) return best;
      if (!best) return item;
      return item.href.length > best.href.length ? item : best;
    }, null) || null;
  const pageDescription = currentMenu?.description || "Panel de administración.";

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col md:ml-16">
        <header className="bg-card sticky top-0 z-20 border-b">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image
                  src="/balanzio.png"
                  alt="Logo de Balanzio"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg object-contain shadow-sm"
                />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-2xl leading-tight font-bold">
                  {currentMenu?.label || "Panel"}
                </h1>
                <p className="text-muted-foreground text-sm">
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
              <NotificationBell />
              <UserMenu />
              <MobileSidebar />
            </div>
          </div>
        </header>
        <main className="flex-1 space-y-6 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
