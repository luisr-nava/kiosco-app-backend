"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/features/auth/components";

export default function SetupLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isOnSales = pathname.startsWith("/dashboard/sales");
  const sellButtonClasses = cn(
    "transition shadow-sm",
    !isOnSales &&
      "animate-pulse ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
  );

  return (
    <div className="min-h-screen">
      <header className="bg-card border-b">
        <div className="flex items-center justify-between gap-4 p-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/balanzio.png"
              alt="Logo de Balanzio"
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
            <NotificationBell />
            <UserMenu />
            <MobileSidebar />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
