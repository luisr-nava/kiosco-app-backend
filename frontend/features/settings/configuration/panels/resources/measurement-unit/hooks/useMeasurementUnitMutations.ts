import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createMeasurementUnitAction,
  deleteMeasurementUnitAction,
  updateMeasurementUnitAction,
} from "../actions";
import type {
  CreateMeasurementUnitDto,
  MeasurementUnit,
  UpdateMeasurementUnitDto,
} from "../types";
import { useShopStore } from "@/features/shop/shop.store";

type MeasurementUnitPage = {
  measurementUnits: MeasurementUnit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const DEFAULT_LIMIT = 10;

const updateMeasurementUnitCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  activeShopId: string | null,
  updater: (page: MeasurementUnitPage, pageIndex: number) => MeasurementUnitPage
) => {
  if (!activeShopId) return;

  queryClient.setQueriesData<InfiniteData<MeasurementUnitPage>>(
    { queryKey: ["measurement-units", activeShopId] },
    (old) => {
      if (!old) return old;

      const pages = old.pages.map((page, index) => updater(page, index));
      return { ...old, pages };
    }
  );
};

const seedMeasurementUnitCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  activeShopId: string | null,
  created: MeasurementUnit
) => {
  if (!activeShopId) return;

  queryClient.setQueryData<InfiniteData<MeasurementUnitPage>>(
    ["measurement-units", activeShopId],
    (old) => {
      if (old) return old;

      return {
        pages: [
          {
            measurementUnits: [created],
            pagination: {
              total: 1,
              page: 1,
              limit: DEFAULT_LIMIT,
              totalPages: 1,
            },
          },
        ],
        pageParams: [1],
      };
    }
  );
};

export const useMeasurementUnitCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: (payload: CreateMeasurementUnitDto) =>
      createMeasurementUnitAction(payload),
    onSuccess: (created, payload) => {
      const normalized = {
        ...payload,
        ...created,
        name: created.name ?? payload.name,
        code: created.code ?? payload.code,
        shopIds: created.shopIds ?? payload.shopIds,
      };
      const data = queryClient.getQueryData<InfiniteData<MeasurementUnitPage>>([
        "measurement-units",
        activeShopId,
      ]);

      if (!data || data.pages.length === 0) {
        seedMeasurementUnitCache(queryClient, activeShopId, normalized);
        return;
      }

      updateMeasurementUnitCache(
        queryClient,
        activeShopId,
        (page, pageIndex) => {
          if (pageIndex !== 0) return page;

          const units = page.measurementUnits ?? [];

          return {
            ...page,
            measurementUnits: [normalized, ...units],
          };
        }
      );
    },
  });
};

export const useMeasurementUnitUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMeasurementUnitDto;
    }) => updateMeasurementUnitAction(id, payload),
    onSuccess: (updated) => {
      updateMeasurementUnitCache(queryClient, activeShopId, (page) => ({
        ...page,
        measurementUnits: page.measurementUnits.map((item) =>
          item.id === updated.id ? updated : item
        ),
      }));
    },
  });
};

export const useMeasurementUnitDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: (id: string) => deleteMeasurementUnitAction(id),
    onSuccess: (_, deletedId) => {
      updateMeasurementUnitCache(queryClient, activeShopId, (page) => {
        const remaining = page.measurementUnits.filter(
          (item) => item.id !== deletedId
        );
        const total = Math.max(
          0,
          (page.pagination?.total ?? page.measurementUnits.length) - 1
        );
        const limit = (page.pagination?.limit ?? remaining.length) || 1;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
          ...page,
          measurementUnits: remaining,
          pagination: {
            ...page.pagination,
            total,
            totalPages,
          },
        };
      });
    },
  });
};
