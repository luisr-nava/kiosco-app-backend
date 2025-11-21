"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  Truck,
  Receipt,
  TrendingUp,
  TrendingDown,
  FolderTree,
  Settings,
  LayoutDashboard,
} from "lucide-react";

export const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Productos",
    href: "/dashboard/productos",
    icon: Package,
  },
  {
    label: "Categorías",
    href: "/dashboard/categorias",
    icon: FolderTree,
  },
  {
    label: "Ventas",
    href: "/dashboard/ventas",
    icon: ShoppingCart,
  },
  {
    label: "Empleados",
    href: "/dashboard/empleados",
    icon: Users,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: UserCircle,
  },
  {
    label: "Proveedores",
    href: "/dashboard/proveedores",
    icon: Truck,
  },
  {
    label: "Compras",
    href: "/dashboard/compras",
    icon: Receipt,
  },
  {
    label: "Ingresos",
    href: "/dashboard/ingresos",
    icon: TrendingUp,
  },
  {
    label: "Egresos",
    href: "/dashboard/egresos",
    icon: TrendingDown,
  },
  {
    label: "Ajustes",
    href: "/dashboard/ajustes",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 border-r bg-card min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Kiosco App</h2>
      </div>

      <nav className="space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
