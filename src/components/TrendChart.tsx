import 'chartjs-adapter-date-fns';

import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, TimeScale, Tooltip } from 'chart.js';
import { format, isAfter, isSameDay, isSameMonth, startOfDay, subDays } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

import type { BloodPressureReading, ReadingType } from '../types/reading';
import { type BloodPressureLevel, getReadingLevel } from '../utils/blood-pressure-level';

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Filler, Tooltip);

interface TrendChartProps {
  readings: BloodPressureReading[];
  readingType: ReadingType;
  targetMonth: Date;
  slidingWindowSize?: number;
}

const getChartColor = (colorName: string, alpha?: number): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${colorName}`).trim() + (alpha || '');
};

export function TrendChart({ readings, readingType, targetMonth, slidingWindowSize = 10 }: TrendChartProps) {
  const [dataPoints, setDataPoints] = useState<{ x: number; y: number; level: BloodPressureLevel; label: string }[]>([]);
  const [slidingAvgPoints, setSlidingAvgPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (readings.length === 0) return;

    const monthReadings = readings.filter(({ timestamp }) => isSameMonth(timestamp, targetMonth));

    setDataPoints(
      monthReadings.map(({ timestamp, ...reading }) => ({
        x: startOfDay(timestamp).getTime(),
        y: reading[readingType],
        level: getReadingLevel(readingType, reading[readingType]),
        label: format(timestamp, 'yyyy. MMM dd. HH:mm', { locale: hu }),
      })),
    );

    setSlidingAvgPoints(
      monthReadings.reduce((points: { x: number; y: number }[], { timestamp }, _, arr) => {
        const isLastOfDay = !arr.some(({ timestamp: other }) => isSameDay(other, timestamp) && isAfter(other, timestamp));
        if (!isLastOfDay) return points;

        const windowStart = subDays(timestamp, slidingWindowSize);
        let count = 0;
        const sum = readings.reduce((sum, reading) => {
          if (isAfter(reading.timestamp, windowStart) && !isAfter(reading.timestamp, timestamp)) {
            count++;
            return sum + reading[readingType];
          }
          return sum;
        }, 0);

        points.push({ x: startOfDay(timestamp).getTime(), y: sum / count });
        return points;
      }, []),
    );
  }, [readings, readingType, targetMonth, slidingWindowSize]);

  if (dataPoints.length === 0) return <div className="text-center py-12 text-cream-100">Nincs adat</div>;

  const data = {
    datasets: [
      {
        label: readingType,
        data: dataPoints,
        pointBackgroundColor: dataPoints.map((point) => getChartColor(`bp-${point.level}`)),
        pointRadius: 4,
        pointHoverRadius: 8,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        tension: 0,
        order: 1,
      },
      {
        label: 'trend',
        data: slidingAvgPoints,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderColor: getChartColor('color-primary', 90),
        backgroundColor: 'transparent',
        borderWidth: 2,
        cubicInterpolationMode: 'monotone' as const,
        spanGaps: false,
        order: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    interaction: {
      mode: 'point' as const,
      intersect: true,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item: { datasetIndex: number }) => item.datasetIndex === 0,
        callbacks: {
          title: (items: { raw: unknown }[]) => {
            const raw = items[0]?.raw as { label?: string };
            return raw?.label?.split(' ').slice(0, 3).join(' ') ?? '';
          },
          label: (ctx: { raw: unknown }) => {
            const raw = ctx.raw as { label?: string; y: number };
            const time = raw.label?.split(' ')[3] ?? '';
            return ` ${time} — ${raw.y}`;
          },
        },
        backgroundColor: getChartColor('color-bg'),
        bodyColor: getChartColor('color-text'),
        titleColor: getChartColor('color-primary'),
        borderColor: getChartColor('color-primary'),
        borderWidth: 1,
        padding: 8,
        bodyFont: { size: 12 },
        titleFont: { size: 12 },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: { unit: 'day' as const },
        adapters: { date: { locale: hu } },
        ticks: { color: getChartColor('color-primary'), font: { size: 11 }, maxRotation: 45 },
        grid: { color: `${getChartColor('color-primary', 30)}` },
        border: { color: getChartColor('color-primary') },
      },
      y: {
        ticks: { color: getChartColor('color-primary'), font: { size: 11 } },
        grid: { color: `${getChartColor('color-primary', 30)}` },
        border: { color: getChartColor('color-primary') },
      },
    },
  };

  return (
    <div className="chart-canvas-container">
      <Line data={data} options={options} />
    </div>
  );
}
