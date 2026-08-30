export const config = {
  narrowBreakpoint: 640,

  slidingWindowSize: parseInt(import.meta.env.VITE_CHART_SLIDING_WINDOW_SIZE) || 10,

  bloodPressureThresholds: {
    systolic: {
      warning: parseInt(import.meta.env.VITE_SYSTOLIC_WARNING) || 120,
      danger: parseInt(import.meta.env.VITE_SYSTOLIC_DANGER) || 140,
    },
    diastolic: {
      warning: parseInt(import.meta.env.VITE_DIASTOLIC_WARNING) || 80,
      danger: parseInt(import.meta.env.VITE_DIASTOLIC_DANGER) || 90,
    },
  },

  chart: {
    pointRadius: 4,
    pointHoverRadius: 16,
    trendLineWidth: 2,
    animationDuration: 200,
    tickFontSize: 11,
    tooltipFontSize: 12,
    tooltipPadding: 8,
    tooltipBorderWidth: 1,
    xAxisMaxRotation: 45,
  },
};
