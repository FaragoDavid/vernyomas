export const config = {
  narrowBreakpoint: 640,

  slidingWindowSize: parseInt(import.meta.env.VITE_CHART_SLIDING_WINDOW_SIZE) || 10,

  bloodPressureThresholds: {
    systolic: {
      low: parseInt(import.meta.env.VITE_SYSTOLIC_LOW) || 90,
      elevated: parseInt(import.meta.env.VITE_SYSTOLIC_ELEVATED) || 140,
      hypertension: parseInt(import.meta.env.VITE_SYSTOLIC_HYPERTENSION) || 160,
    },
    diastolic: {
      low: parseInt(import.meta.env.VITE_DIASTOLIC_LOW) || 60,
      elevated: parseInt(import.meta.env.VITE_DIASTOLIC_ELEVATED) || 90,
      hypertension: parseInt(import.meta.env.VITE_DIASTOLIC_HYPERTENSION) || 110,
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
