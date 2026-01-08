import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="border-border bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/balanzio.png"
            alt="Logo de Balanzio"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-lg object-contain shadow-sm"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold">Balanzio</span>
            <span className="text-muted-foreground text-xs">
              Gestión para tu negocio
            </span>
          </div>
        </Link>
        <Link href="/dashboard/sales">
          <Button size="sm">Vender</Button>
        </Link>
      </div>
    </nav>
  );
}
