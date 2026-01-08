"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";

const formatDate = (date: string) =>
  new Date(date).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });

export const NotificationBell = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Abrir notificaciones"
        >
          <Bell className="h-5 w-5" />
          {/* {unreadCount > 0 && ( */}
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
            {/* {unreadCount > 9 ? "9+" : unreadCount} */}
          </span>
          {/* )} */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {/* {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )} */}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* {latestNotifications.length === 0 ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">
            Sin notificaciones nuevas.
          </div>
        ) : (
          latestNotifications.map((notification) => {
            const read = Boolean(notification.readAt || notification.isRead);
            return (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col gap-1 items-start">
                <div className="flex w-full items-start gap-2">
                  {!read ? (
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : (
                    <Check className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    {!read && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0 text-xs"
                        onClick={() => markNotificationAsRead(notification.id)}>
                        Marcar como leída
                      </Button>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {notification.type}
                </Badge>
              </DropdownMenuItem>
            );
          })
        )} */}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            // onClick={() => markAllAsRead()}
            // disabled={unreadCount === 0}
          >
            Marcar todas como leídas
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-xs"
            onClick={() => router.push("/dashboard/notifications")}
          >
            Ver todas
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
