"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/lib/api/shop.api";
import type { ShopDetail } from "@/lib/types/shop";
import type { CashRegister } from "@/lib/types/cash-register";
import { useAuth } from "@/app/(auth)/hooks";
import { StoreSelector } from "@/components/shops/store-selector";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { cashRegisterApi } from "@/lib/api/cash-register.api";
import { OpenCashRegisterModal } from "@/components/cash-register/open-cash-register-modal";

interface StoreSetupGuardProps {
  children: ReactNode;
}

/**
 * Guard que verifica si el usuario tiene una tienda configurada.
 * Si no tiene tienda, muestra un modal para crear/seleccionar.
 */
export function StoreSetupGuard({ children }: StoreSetupGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    shops: storedShops,
    activeShopId,
    setShops,
    setActiveShopId,
    setActiveShop,
    activeShop,
    activeShopLoading,
    setActiveShopLoading,
  } = useShopStore();
  const [showOpenCashModal, setShowOpenCashModal] = useState(false);

  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ["my-shops"],
    queryFn: shopApi.getMyShops,
    enabled: isAuthenticated && !authLoading,
    retry: 1,
  });

  const shopDetailQuery = useQuery<ShopDetail>({
    queryKey: ["shop", activeShopId],
    queryFn: () => shopApi.getShopById(activeShopId || ""),
    enabled: Boolean(activeShopId),
  });
  const hasOpenCashDetail =
    shopDetailQuery.data?.hasOpenCashRegister ??
    activeShop?.hasOpenCashRegister;
  const shopHasOpenCash = hasOpenCashDetail === true;

  const { data: openCashRegister, isFetching: cashRegisterLoading } =
    useQuery<CashRegister | null>({
      queryKey: ["cash-register-open", activeShopId],
      queryFn: () => cashRegisterApi.getOpenCashRegister(activeShopId || ""),
      enabled:
        Boolean(activeShopId) && !shopHasOpenCash && !shopDetailQuery.isLoading,
      retry: false,
    });

  // Permitir abrir manualmente el selector mediante un evento global
  useEffect(() => {
    const handler = () => {
      setActiveShopId("");
      setActiveShop(null);
    };
    window.addEventListener("open-store-selector", handler);
    return () => window.removeEventListener("open-store-selector", handler);
  }, [setActiveShop, setActiveShopId]);

  // Actualizar tienda activa cuando el detalle llega
  useEffect(() => {
    if (shopDetailQuery.data && shopDetailQuery.data.id !== activeShop?.id) {
      setActiveShop(shopDetailQuery.data);
    }
  }, [shopDetailQuery.data, activeShop?.id, setActiveShop]);

  // Manejar errores al obtener tienda activa
  useEffect(() => {
    if (shopDetailQuery.isError && (activeShop || activeShopLoading)) {
      setActiveShop(null);
      if (activeShopLoading) {
        setActiveShopLoading(false);
      }
    }
  }, [
    shopDetailQuery.isError,
    activeShop,
    activeShopLoading,
    setActiveShop,
    setActiveShopLoading,
  ]);

  // Sincronizar loading con estado real del query (evitar sets repetidos)
  useEffect(() => {
    // Solo mostramos loading cuando no tenemos datos de la tienda activa todavía
    const nextLoading = Boolean(
      !activeShop && activeShopId && shopDetailQuery.isFetching,
    );
    if (nextLoading !== activeShopLoading) {
      setActiveShopLoading(nextLoading);
    }
  }, [
    activeShop,
    activeShopId,
    shopDetailQuery.isFetching,
    activeShopLoading,
    setActiveShopLoading,
  ]);

  // Guardar tiendas en el store global cuando se cargan
  useEffect(() => {
    if (shops) {
      setShops(shops);

      const activeExists =
        activeShopId && shops.some((shop) => shop.id === activeShopId);

      // Si no hay tiendas o la activa ya no existe, forzar selección
      if (!activeExists || shops.length === 0) {
        if (activeShopId) {
          setActiveShopId("");
        }
        setActiveShop(null);
      }
    }
  }, [shops, activeShopId, setActiveShopId, setActiveShop, setShops]);

  useEffect(() => {
    if (!activeShopId) {
      setShowOpenCashModal(false);
      return;
    }

    if (shopHasOpenCash) {
      setShowOpenCashModal(false);
      return;
    }

    if (cashRegisterLoading) return;

    const needsOpening = !openCashRegister || openCashRegister.isOpen === false;
    setShowOpenCashModal(needsOpening);
  }, [activeShopId, cashRegisterLoading, openCashRegister, shopHasOpenCash]);

  const hasStoredShops = (storedShops?.length ?? 0) > 0;
  const hasValidActiveShop =
    Boolean(activeShopId) &&
    storedShops.some((shop) => shop.id === activeShopId);

  const handleCashRegisterOpened = () => {
    setShowOpenCashModal(false);
    if (activeShopId) {
      queryClient.invalidateQueries({
        queryKey: ["cash-register-open", activeShopId],
      });
    }
    if (activeShop) {
      setActiveShop({ ...activeShop, hasOpenCashRegister: true });
      queryClient.setQueryData<ShopDetail | undefined>(
        ["shop", activeShopId],
        (prev) => (prev ? { ...prev, hasOpenCashRegister: true } : prev),
      );
    }
  };

  const activeShopName =
    activeShop?.name ||
    storedShops.find((shop) => shop.id === activeShopId)?.name ||
    null;

  // Mostrar loading mientras verifica
  if (authLoading || shopsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  const needsSelection =
    isAuthenticated &&
    (!hasValidActiveShop || !hasStoredShops || !activeShopId);

  const handleSelectStore = (storeId: string) => {
    setActiveShopId(storeId);
    if (pathname === "/dashboard/setup") {
      router.push("/dashboard");
    }
  };

  if (needsSelection) {
    return (
      <StoreSelector
        shops={storedShops || []}
        onSelect={handleSelectStore}
        onCreateSuccess={handleSelectStore}
      />
    );
  }

  // Si tiene tiendas, mostrar el contenido
  const shouldShowOpenCashModal =
    showOpenCashModal &&
    !shopHasOpenCash &&
    !(openCashRegister && openCashRegister.isOpen);

  return (
    <>
      {children}
      <OpenCashRegisterModal
        isOpen={shouldShowOpenCashModal}
        shopId={activeShopId}
        shopName={activeShopName}
        onOpened={handleCashRegisterOpened}
      />
    </>
  );
}

