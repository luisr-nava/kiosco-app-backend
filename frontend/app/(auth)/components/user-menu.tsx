"use client";

import { useAuth, useLogout } from "../hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Store, Check } from "lucide-react";
import { useShopStore } from "@/app/(private)/store/shops.slice";

/**
 * UserMenu - Menú de usuario con información y opción de logout
 * Solo se renderiza si el usuario está autenticado
 */
export function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const { logout, isLoading } = useLogout();
  const { shops, activeShopId, setActiveShopId } = useShopStore();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Obtener iniciales del nombre completo
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              <span className="font-semibold">Rol:</span> {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
          Tus tiendas
        </DropdownMenuLabel>
        {shops.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No tienes tiendas</span>
          </DropdownMenuItem>
        ) : (
          shops.map((shop) => {
            const isActive = shop.id === activeShopId;
            return (
              <DropdownMenuItem
                key={shop.id}
                onClick={() => setActiveShopId(shop.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span className="truncate">{shop.name}</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
