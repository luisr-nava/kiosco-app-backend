import type { ChartOptions, TooltipItem } from "chart.js";

const axisTickColor = "rgba(148, 163, 184, 0.95)";
const axisGridColor = "rgba(148, 163, 184, 0.1)";
const tooltipBackgroundColor = "rgba(15, 23, 42, 0.95)";
const tooltipBorderColor = "rgba(148, 163, 184, 0.25)";
const tooltipTitleColor = "#cbd5f5";
const tooltipBodyColor = "#f8fafc";

const formatCurrency = (value: number) =>
  `$${Number(value ?? 0).toLocaleString("es-AR")}`;

const getParsedValue = (context: TooltipItem<"bar">) => {
  const parsed = context.parsed;
  if (typeof parsed === "number") {
    return parsed;
  }

  if (parsed?.y) {
    return parsed.y;
  }

  return 0;
};

const baseChartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 360,
  },
  interaction: {
    mode: "index",
    intersect: false,
  },
};

const defaultPlugins: ChartOptions<"bar">["plugins"] = {
  legend: {
    display: false,
  },
};

const tooltipBase = {
  backgroundColor: tooltipBackgroundColor,
  borderColor: tooltipBorderColor,
  borderWidth: 1,
  padding: 12,
  titleColor: tooltipTitleColor,
  bodyColor: tooltipBodyColor,
};

const buildMetricTooltipCallbacks = () => ({
  title: (items: TooltipItem<"bar">[]) => items[0]?.label ?? "",
  label: (context: TooltipItem<"bar">) => formatCurrency(getParsedValue(context)),
});

const buildCombinedTooltipCallbacks = () => ({
  title: (items: TooltipItem<"bar">[]) => items[0]?.label ?? "",
  label: (context: TooltipItem<"bar">) => {
    const label = context.dataset.label ?? "";
    const value = formatCurrency(getParsedValue(context));
    return label ? `${label}: ${value}` : value;
  },
});

const baseXAxis = {
  type: "category" as const,
  grid: {
    display: false,
    drawBorder: false,
  },
  ticks: {
    color: axisTickColor,
    font: {
      size: 11,
    },
    padding: 8,
  },
};

const baseYAxis = {
  grid: {
    color: axisGridColor,
    drawBorder: false,
    tickLength: 0,
  },
  ticks: {
    color: axisTickColor,
    font: {
      size: 11,
    },
    stepSize: undefined,
  },
};

export const createMetricChartOptions = (): ChartOptions<"bar"> => ({
  ...baseChartOptions,
  scales: {
    x: {
      ...baseXAxis,
    },
    y: {
      ...baseYAxis,
      beginAtZero: true,
    },
  },
  plugins: {
    ...defaultPlugins,
    tooltip: {
      ...tooltipBase,
      callbacks: buildMetricTooltipCallbacks(),
    },
  },
});

export const createCombinedChartOptions = (): ChartOptions<"bar"> => ({
  ...baseChartOptions,
  scales: {
    x: {
      ...baseXAxis,
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
  },
  plugins: {
    ...defaultPlugins,
    tooltip: {
      ...tooltipBase,
      callbacks: buildCombinedTooltipCallbacks(),
    },
  },
});
