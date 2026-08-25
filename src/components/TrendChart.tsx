import { useEffect, useState } from 'react';
import { isSameMonth } from 'date-fns';
import type { BloodPressureReading } from '../types/reading';

interface Point {
  x: number;
  y: number;
  label: string;
}

interface TrendChartProps {
  readings: BloodPressureReading[];
  type: 'systolic' | 'diastolic' | 'pulse';
  targetMonth: Date;
  slidingWindowSize?: number;
}

export function TrendChart({ readings, type, targetMonth, slidingWindowSize = 10 }: TrendChartProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 640);

  useEffect(() => {
    if (readings.length === 0) return;

    const dataPoints = readings
      .filter((r) => isSameMonth(r.timestamp, targetMonth))
      .map((reading, index) => ({
        x: index,
        y: type === 'systolic' ? reading.systolic : type === 'diastolic' ? reading.diastolic : reading.pulse,
        label: reading.timestamp.toLocaleDateString(),
      }));

    setPoints(dataPoints);
  }, [readings, type, targetMonth]);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (points.length === 0) return <div className="text-center py-12 text-cream-100">Nincs adat</div>;

  const maxY = Math.max(...points.map((p) => p.y));
  const minY = Math.min(...points.map((p) => p.y));
  const range = maxY - minY || 1;

  const chartHeight = 200;
  const baseChartWidth = Math.max(400, points.length * 40);
  const chartWidth = isNarrow ? Math.min(baseChartWidth, window.innerWidth - 100) : baseChartWidth;
  const padding = 40;
  const dataAreaWidth = chartWidth * 0.9;
  const dataStartX = chartWidth * 0.05;

  const windowSize = slidingWindowSize;
  const slidingAverage = points.map((_, i) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(points.length, i + Math.floor(windowSize / 2) + 1);
    const avg = points.slice(start, end).reduce((sum, p) => sum + p.y, 0) / (end - start);
    return { ...points[i], y: avg };
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
        {[0, 0.5, 1].map((ratio) => {
          const y = padding + (1 - ratio) * chartHeight;
          const value = Math.round(minY + ratio * range);
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={chartWidth + padding} y2={y} stroke="#ee9424" strokeDasharray="4" strokeOpacity="0.5" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#ee9424">
                {value}
              </text>
            </g>
          );
        })}
        <line x1={padding} y1={padding} x2={padding} y2={padding + chartHeight} stroke="#ee9424" strokeWidth="2" />
        <line
          x1={padding}
          y1={padding + chartHeight}
          x2={chartWidth + padding}
          y2={padding + chartHeight}
          stroke="#ee9424"
          strokeWidth="2"
        />
        {slidingAverage.length > 1 && (
          <polyline
            points={slidingAverage
              .map(
                (p) =>
                  `${padding + dataStartX + (p.x / (points.length - 1)) * dataAreaWidth},${padding + (1 - (p.y - minY) / range) * chartHeight}`,
              )
              .join(' ')}
            stroke="#c1440e"
            strokeWidth="2"
            fill="none"
          />
        )}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={padding + dataStartX + (p.x / Math.max(1, points.length - 1)) * dataAreaWidth}
            cy={padding + (1 - (p.y - minY) / range) * chartHeight}
            r="4"
            fill="#ee9424"
          />
        ))}
      </svg>
    </div>
  );
}
