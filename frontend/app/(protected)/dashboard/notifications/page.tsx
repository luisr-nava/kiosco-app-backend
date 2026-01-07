"use client";
import { Bell, Check, RefreshCcw } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const formatDate = (date: string) =>
  new Date(date).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });

export default function NotificationsPage() {
  // const {
  //   notifications,
  //   unreadCount,
  //   isUpdating,
  //   refreshNotifications,
  //   markNotificationAsRead,
  //   markAllAsRead,
  // } = useNotifications();

  // const hasNotifications = notifications.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground text-sm">
            Alertas en tiempo real sobre stock y actividad de tus tiendas.
          </p>
        </div>
        {/* <Badge variant={unreadCount > 0 ? "default" : "outline"}>
          {unreadCount} sin leer
        </Badge> */}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bandeja de notificaciones
            </CardTitle>
            <CardDescription>
              Se sincroniza al iniciar sesión y escucha nuevas alertas por WebSocket.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              // onClick={refreshNotifications}
              // disabled={isUpdating}
            >
              <RefreshCcw
              // className={`mr-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              // onClick={() => markAllAsRead()}
              // disabled={unreadCount === 0}
            >
              Marcar todas como leídas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* {!hasNotifications ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Sin notificaciones todavía</p>
                <p className="text-sm text-muted-foreground">
                  Las alertas de stock bajo aparecerán aquí. Mantén la sesión
                  iniciada para recibirlas en tiempo real.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => {
              const read = Boolean(notification.readAt || notification.isRead);
              return (
                <div
                  key={notification.id}
                  className="flex gap-3 rounded-lg border bg-card/50 p-3">
                  <div className="mt-1">
                    {read ? (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="inline-block h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{notification.type}</Badge>
                        <p className="font-semibold leading-tight">
                          {notification.title}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      {!read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }>
                          Marcar como leída
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Tienda: {notification.shopId}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )} */}
        </CardContent>
      </Card>

      {/* {hasNotifications && <Separator />} */}
    </div>
  );
}
