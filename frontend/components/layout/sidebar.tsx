"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  Truck,
  Receipt,
  TrendingUp,
  TrendingDown,
  Settings,
  LayoutDashboard,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";

export const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Resumen general de tu negocio.",
  },
  {
    label: "Productos",
    href: "/dashboard/products",
    icon: Package,
    description: "Listado de productos de la tienda seleccionada.",
  },
  {
    label: "Vender",
    href: "/dashboard/sales",
    icon: ShoppingCart,
    description: "Punto de venta rápido para la tienda activa.",
  },
  {
    label: "Ventas",
    href: "/dashboard/sales/history",
    icon: FileText,
    description: "Historial y detalle de ventas realizadas.",
  },
  {
    label: "Empleados",
    href: "/dashboard/employees",
    icon: Users,
    description: "Administra el equipo de trabajo.",
  },
  {
    label: "Clientes",
    href: "/dashboard/clients",
    icon: UserCircle,
    description: "Gestiona los clientes de tu negocio.",
  },
  {
    label: "Proveedores",
    href: "/dashboard/suppliers",
    icon: Truck,
    description: "Organiza proveedores y relaciones de compra.",
  },
  {
    label: "Compras",
    href: "/dashboard/purchases",
    icon: Receipt,
    description: "Controla y registra las compras realizadas.",
  },
  {
    label: "Ingresos",
    href: "/dashboard/incomes",
    icon: TrendingUp,
    description: "Registra ingresos adicionales de la tienda.",
  },
  {
    label: "Egresos",
    href: "/dashboard/expenses",
    icon: TrendingDown,
    description: "Administra y registra los gastos.",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isInSettings = pathname.startsWith("/dashboard/settings");
  const isInCategories = pathname.startsWith("/dashboard/category");
  const showSettingsExpanded = settingsOpen || (!collapsed && (isInSettings || isInCategories));

  return (
    <aside
      className={cn(
        "hidden md:block fixed inset-y-0 left-0 z-30 border-r bg-card group transition-all duration-300",
        collapsed ? "w-16 hover:w-64" : "w-64",
      )}>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-4">
          <button
            type="button"
            aria-label="Alternar menú"
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors">
            {collapsed ? (
              <Menu className="h-5 w-5 flex-shrink-0" />
            ) : (
              <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            )}
          </button>
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              collapsed
                ? "w-0 opacity-0 group-hover:w-auto group-hover:opacity-100"
                : "w-auto opacity-100",
            )}>
            <h2 className="text-2xl font-bold whitespace-nowrap">Kiosco App</h2>
          </div>
        </div>

        <nav className="space-y-1 px-2 pb-6 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed
                    ? "justify-center group-hover:justify-start"
                    : "justify-start",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={cn(
                    "block overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200",
                    collapsed
                      ? "max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100"
                      : "max-w-[200px] opacity-100",
                  )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed
                  ? "justify-center group-hover:justify-start"
                  : "justify-start",
                isInSettings || isInCategories
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}>
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "block overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200",
                  collapsed
                    ? "max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100"
                    : "max-w-[200px] opacity-100",
                )}>
                Ajustes
              </span>
              {!collapsed &&
                (showSettingsExpanded ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                ))}
            </button>

            {showSettingsExpanded && (
              <div
                className={cn(
                  "pl-10 pr-2 space-y-1",
                  collapsed
                    ? "opacity-0 group-hover:opacity-100 group-hover:pl-3"
                    : "opacity-100",
                )}>
                <Link
                  href="/settings/preferences"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                    pathname === "/settings/preferences"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}>
                  <span>Preferencias</span>
                </Link>
                <Link
                  href="/settings/category"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                    isInCategories
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}>
                  <span>Categorías</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}


