"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  // const queryClient = useQueryClient();
  // const { isAuthenticated, isLoading: authLoading } = useAuth();
  // const {
  //   shops: storedShops,
  //   activeShopId,
  //   setShops,
  //   setActiveShopId,
  //   setActiveShop,
  //   activeShop,
  //   activeShopLoading,
  //   setActiveShopLoading,
  //   shouldForceStoreSelection,
  //   setShouldForceStoreSelection,
  // } = useShopStore();
  // const shopStorePersist = useShopStore.persist;
  // const [showOpenCashModal, setShowOpenCashModal] = useState(false);

  // const [isShopStoreHydrated, setIsShopStoreHydrated] = useState(() =>
  //   shopStorePersist.hasHydrated(),
  // );
  // const selectedShopId = activeShopId;
  // const userHasAccessToSelectedShop =
  //   Boolean(selectedShopId) &&
  //   storedShops.some((shop) => shop.id === selectedShopId);

  // const { data: shops, isLoading: shopsLoading } = useQuery({
  //   queryKey: ["my-shops"],
  //   queryFn: shopApi.getMyShops,
  //   enabled: isAuthenticated && !authLoading,
  //   retry: 1,
  // });

  // const shopDetailQuery = useQuery<ShopDetail>({
  //   queryKey: ["shop", selectedShopId],
  //   queryFn: () => shopApi.getShopById(selectedShopId || ""),
  //   enabled: Boolean(selectedShopId && userHasAccessToSelectedShop),
  // });
  // const hasOpenCashDetail =
  //   shopDetailQuery.data?.hasOpenCashRegister ??
  //   activeShop?.hasOpenCashRegister;
  // const shopHasOpenCash = hasOpenCashDetail === true;
  // const needsCashStatusCheck = hasOpenCashDetail === undefined;

  // const { data: openCashRegister, isFetching: cashRegisterLoading } =
  //   useQuery<CashRegister | null>({
  //     queryKey: ["cash-register-open", selectedShopId],
  //     queryFn: () => cashRegisterApi.getOpenCashRegister(selectedShopId || ""),
  //     enabled:
  //       Boolean(selectedShopId) &&
  //       userHasAccessToSelectedShop &&
  //       needsCashStatusCheck &&
  //       shopDetailQuery.isSuccess &&
  //       !shouldForceStoreSelection,
  //     retry: false,
  //   });

  // Permitir abrir manualmente el selector mediante un evento global
  // useEffect(() => {
  //   const handler = () => {
  //     setActiveShopId("");
  //     setActiveShop(null);
  //     setShouldForceStoreSelection(true);
  //   };
  //   window.addEventListener("open-store-selector", handler);
  //   return () => window.removeEventListener("open-store-selector", handler);
  // }, [setActiveShop, setActiveShopId, setShouldForceStoreSelection]);

  // useEffect(() => {
  //   if (shopStorePersist.hasHydrated()) {
  //     setIsShopStoreHydrated(true);
  //     return;
  //   }

  //   const unsubscribe = shopStorePersist.onFinishHydration(() => {
  //     setIsShopStoreHydrated(true);
  //   });

  //   return unsubscribe;
  // }, [shopStorePersist]);

  // Actualizar tienda activa cuando el detalle llega
  // useEffect(() => {
  //   if (shopDetailQuery.data) {
  //     setActiveShop(shopDetailQuery.data);
  //   }
  // }, [shopDetailQuery.data, setActiveShop]);

  // // Manejar errores al obtener tienda activa
  // useEffect(() => {
  //   if (shopDetailQuery.isError && (activeShop || activeShopLoading)) {
  //     setActiveShop(null);
  //     if (activeShopLoading) {
  //       setActiveShopLoading(false);
  //     }
  //   }
  // }, [
  //   shopDetailQuery.isError,
  //   activeShop,
  //   activeShopLoading,
  //   setActiveShop,
  //   setActiveShopLoading,
  // ]);

  // Sincronizar loading con estado real del query (evitar sets repetidos)
  // useEffect(() => {
  //   // Solo mostramos loading cuando no tenemos datos de la tienda activa todavía
  //   const nextLoading = Boolean(
  //     !activeShop && activeShopId && shopDetailQuery.isFetching,
  //   );
  //   if (nextLoading !== activeShopLoading) {
  //     setActiveShopLoading(nextLoading);
  //   }
  // }, [
  //   activeShop,
  //   activeShopId,
  //   shopDetailQuery.isFetching,
  //   activeShopLoading,
  //   setActiveShopLoading,
  // ]);

  // Guardar tiendas en el store global cuando se cargan
  // useEffect(() => {
  //   if (shops) {
  //     setShops(shops);

  //     const activeExists =
  //       activeShopId && shops.some((shop) => shop.id === activeShopId);

  //     // Si no hay tiendas o la activa ya no existe, forzar selección
  //     if (!activeExists || shops.length === 0) {
  //       if (activeShopId) {
  //         setActiveShopId("");
  //       }
  //       setActiveShop(null);
  //     }
  //   }
  // }, [shops, activeShopId, setActiveShopId, setActiveShop, setShops]);

  // useEffect(() => {
  //   if (!selectedShopId) {
  //     setShowOpenCashModal(false);
  //     return;
  //   }

  //   // if (!shopDetailQuery.isSuccess) {
  //   //   setShowOpenCashModal(false);
  //   //   return;
  //   // }

  //   // if (shopHasOpenCash) {
  //   //   setShowOpenCashModal(false);
  //   //   return;
  //   // }

  //   // if (cashRegisterLoading) return;

  //   const needsOpening = !openCashRegister || openCashRegister.isOpen === false;
  //   setShowOpenCashModal(needsOpening);
  // }, [
  //   selectedShopId,
  //   shopDetailQuery.isSuccess,
  //   cashRegisterLoading,
  //   openCashRegister,
  //   shopHasOpenCash,
  // ]);

  // useEffect(() => {
  //   if (selectedShopId && !userHasAccessToSelectedShop) {
  //     setActiveShopId("");
  //     setActiveShop(null);
  //     setShouldForceStoreSelection(true);
  //   }
  // }, [
  //   selectedShopId,
  //   userHasAccessToSelectedShop,
  //   setActiveShopId,
  //   setActiveShop,
  //   setShouldForceStoreSelection,
  // ]);

  // const handleCashRegisterOpened = () => {
  //   setShowOpenCashModal(false);
  //   if (selectedShopId) {
  //     queryClient.invalidateQueries({
  //       queryKey: ["cash-register-open", selectedShopId],
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["shop", selectedShopId] });
  //   }
  //   if (activeShop) {
  //     setActiveShop({ ...activeShop, hasOpenCashRegister: true });
  //     queryClient.setQueryData<ShopDetail | undefined>(
  //       ["shop", selectedShopId],
  //       (prev) => (prev ? { ...prev, hasOpenCashRegister: true } : prev),
  //     );
  //   }
  // };

  // const activeShopName = shouldForceStoreSelection
  //   ? null
  //   : activeShop?.name ||
  //     storedShops.find((shop) => shop.id === selectedShopId)?.name ||
  //     null;

  // Mostrar loading mientras verifica
  // if (authLoading || shopsLoading || !isShopStoreHydrated) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Verificando configuración...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // const needsSelection = isAuthenticated && !activeShopId;
  // const handleSelectStore = (storeId: string) => {
  //   setActiveShopId(storeId);
  //   setShouldForceStoreSelection(false);
  // };

  // if (needsSelection) {
  //   return (
  //     <StoreSelector
  //       shops={storedShops || []}
  //       onSelect={handleSelectStore}
  //       onCreateSuccess={handleSelectStore}
  //     />
  //   );
  // }

  // Si tiene tiendas, mostrar el contenido
  // const shouldShowOpenCashModal =
  //   showOpenCashModal &&
  //   !shouldForceStoreSelection &&
  //   !shopHasOpenCash &&
  //   !(openCashRegister && openCashRegister.isOpen);

  return (
    <>
      {children}
      {/* <OpenCashRegisterModal
        isOpen={shouldShowOpenCashModal}
        shopId={selectedShopId}
        shopName={activeShopName}
        onOpened={handleCashRegisterOpened}
      /> */}
    </>
  );
}

