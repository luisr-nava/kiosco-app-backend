import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur ">
      <div className=" px-10 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/kioscoapp.png"
            alt="Logo de Kiosco App"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-lg object-contain shadow-sm"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold">Kiosco App</span>
            <span className="text-xs text-muted-foreground">Gestión para tu negocio</span>
          </div>
        </Link>
        <Link href="/dashboard/sales">
          <Button size="sm">Vender</Button>
        </Link>
      </div>
    </nav>
  );
}
