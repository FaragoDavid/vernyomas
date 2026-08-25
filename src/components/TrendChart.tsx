import { isSameMonth } from 'date-fns';
import { useEffect, useState } from 'react';

import { useNarrow } from '../hooks/use-narrow';
import type { BloodPressureReading, ReadingType } from '../types/reading';
import { type BloodPressureLevel, getReadingLevel } from '../utils/blood-pressure-level';

interface Point {
  x: number;
  y: number;
  trend: number;
  label: string;
  level: BloodPressureLevel;
}

interface TrendChartProps {
  readings: BloodPressureReading[];
  readingType: ReadingType;
  targetMonth: Date;
  slidingWindowSize?: number;
}

const getChartColor = (colorName: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${colorName}`).trim();
};

const getColorValue = (level: BloodPressureLevel): string => {
  return getChartColor(`bp-${level}`);
};

export function TrendChart({ readings, readingType, targetMonth, slidingWindowSize = 10 }: TrendChartProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const isNarrow = useNarrow();

  useEffect(() => {
    if (readings.length === 0) return;

    const readingsOfTargetMonth = readings.filter(({ timestamp }) => isSameMonth(timestamp, targetMonth));
    if (readingsOfTargetMonth.length === 0) {
      setPoints([]);
      return;
    }

    const minDay = Math.min(...readingsOfTargetMonth.map(({ timestamp }) => timestamp.getDate()));
    const maxDay = Math.max(...readingsOfTargetMonth.map(({ timestamp }) => timestamp.getDate()));
    const dayRange = maxDay - minDay || 1;

    const dataPoints = readingsOfTargetMonth.map(({ timestamp, ...reading }) => {
      const value = reading[readingType];
      const readingIndex = readings.findIndex((r) => r.timestamp === timestamp);
      const windowStart = Math.max(0, readingIndex - slidingWindowSize + 1);
      const windowEnd = readingIndex + 1;
      const trendValue = readings.slice(windowStart, windowEnd).reduce((sum, r) => sum + r[readingType], 0) / (windowEnd - windowStart);
      return {
        x: (timestamp.getDate() - minDay) / dayRange,
        y: value,
        trend: trendValue,
        label: timestamp.toLocaleDateString(),
        level: getReadingLevel(readingType, value),
      };
    });

    setPoints(dataPoints);
  }, [readings, readingType, targetMonth, slidingWindowSize]);

  if (points.length === 0) return <div className="text-center py-12 text-cream-100">Nincs adat</div>;

  const maxY = Math.max(...points.map((p) => p.y));
  const minY = Math.min(...points.map((p) => p.y));
  const range = maxY - minY || 1;

  const chartHeight = 200;
  const baseChartWidth = 400;
  const chartWidth = isNarrow ? Math.min(baseChartWidth, window.innerWidth - 100) : baseChartWidth;
  const padding = 40;

  const renderGridLines = () => {
    const strokeColor = getChartColor('color-amber');
    return (
      <>
        {[0, 0.5, 1].map((ratio) => {
          const y = padding + (1 - ratio) * chartHeight;
          const value = Math.round(minY + ratio * range);
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={chartWidth + padding} y2={y} stroke={strokeColor} strokeDasharray="4" strokeOpacity="0.5" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill={strokeColor}>
                {value}
              </text>
            </g>
          );
        })}
      </>
    );
  };

  const renderAxes = () => {
    const strokeColor = getChartColor('color-amber');
    return (
      <>
        <line x1={padding} y1={padding} x2={padding} y2={padding + chartHeight} stroke={strokeColor} strokeWidth="2" />
        <line
          x1={padding}
          y1={padding + chartHeight}
          x2={chartWidth + padding}
          y2={padding + chartHeight}
          stroke={strokeColor}
          strokeWidth="2"
        />
      </>
    );
  };

  const renderTrendLine = () => {
    const trendColor = getChartColor('color-accent');
    return (
      points.length > 1 && (
        <polyline
          points={points.map((p) => `${padding + p.x * chartWidth},${padding + (1 - (p.trend - minY) / range) * chartHeight}`).join(' ')}
          stroke={trendColor}
          strokeWidth="2"
          fill="none"
        />
      )
    );
  };

  const renderDataPoints = () =>
    points.map((point, i) => {
      const cx = padding + point.x * chartWidth;
      const cy = padding + (1 - (point.y - minY) / range) * chartHeight;
      return <circle key={i} cx={cx} cy={cy} r="4" fill={getColorValue(point.level)} />;
    });

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + padding * 2}`}
        width={chartWidth + padding * 2}
        height={chartHeight + padding * 2}
        className="mx-auto"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {renderGridLines()}
        {renderAxes()}
        {renderTrendLine()}
        {renderDataPoints()}
      </svg>
    </div>
  );
}
