import { format, isAfter, isBefore, isSameDay, isSameMonth, subDays } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useEffect, useState } from 'react';

import { useNarrow } from '../hooks/use-narrow';
import type { BloodPressureReading, ReadingType } from '../types/reading';
import { type BloodPressureLevel, getReadingLevel } from '../utils/blood-pressure-level';

interface Point {
  x: number;
  y: number;
  label: string;
  level: BloodPressureLevel;
}

interface SlidingAveragePoint {
  x: number;
  y: number;
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
  const [slidingAvgPoints, setSlidingAvgPoints] = useState<SlidingAveragePoint[]>([]);
  const [tooltip, setTooltip] = useState<{ clientX: number; clientY: number; date: string; value: number } | null>(null);
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

    const daysOfSlidingAvg = new Set();
    setSlidingAvgPoints(
      readingsOfTargetMonth.reduce((points: SlidingAveragePoint[], { timestamp }) => {
        if (daysOfSlidingAvg.has(format(timestamp, 'yyyyMMdd'))) return points;
        daysOfSlidingAvg.add(format(timestamp, 'yyyyMMdd'));

        const avgStartDate = subDays(timestamp, slidingWindowSize);
        let readingCountInSlidingWindow = 0;
        const slidingWindowSum = readings.reduce((sum, reading) => {
          if (isAfter(reading.timestamp, avgStartDate) && !isAfter(reading.timestamp, timestamp)) {
            readingCountInSlidingWindow++;
            return sum + reading[readingType];
          }
          return sum;
        }, 0);

        points.push({
          x: (timestamp.getDate() - minDay) / dayRange,
          y: slidingWindowSum / readingCountInSlidingWindow,
        });

        return points;
      }, []),
    );

    const dataPoints = readingsOfTargetMonth.map(({ timestamp, ...reading }) => {
      const value = reading[readingType];
      return {
        x: (timestamp.getDate() - minDay) / dayRange,
        y: value,
        label: format(timestamp, isNarrow ? 'MMM d' : 'yyyy. MMM dd.', { locale: hu }),
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
    if (slidingAvgPoints.length < 2) return null;

    const coords = slidingAvgPoints.map((p) => ({
      x: padding + p.x * chartWidth,
      y: padding + (1 - (p.y - minY) / range) * chartHeight,
    }));

    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const curr = coords[i];
      const prev = coords[i - 1];
      const next = coords[i + 1];

      const cp1x = prev.x + (curr.x - prev.x) / 3;
      const cp1y = prev.y + (curr.y - prev.y) / 3;
      const cp2x = curr.x - (next ? (next.x - curr.x) / 3 : 0);
      const cp2y = curr.y - (next ? (next.y - curr.y) / 3 : 0);

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return <path d={pathD} stroke={trendColor} strokeWidth="2" fill="none" />;
  };

  const renderDataPoints = () =>
    points.map((point, i) => {
      const cx = padding + point.x * chartWidth;
      const cy = padding + (1 - (point.y - minY) / range) * chartHeight;
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="4"
          fill={getColorValue(point.level)}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ clientX: rect.left, clientY: rect.top, date: point.label, value: point.y });
          }}
          onMouseLeave={() => setTooltip(null)}
          style={{ cursor: 'pointer' }}
        />
      );
    });

  return (
    <div className="overflow-x-auto relative">
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
      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.clientX, top: tooltip.clientY }}>
          <b>{tooltip.date}:</b> {tooltip.value}
        </div>
      )}
    </div>
  );
}
