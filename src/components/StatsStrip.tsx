import { useNarrow } from '../hooks/use-narrow';
import type { BloodPressureReading } from '../types/reading';

export function StatsStrip({ readings }: { readings: BloodPressureReading[] }) {
  const isNarrow = useNarrow();

  if (readings.length === 0) return null;

  const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
  const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
  const avgPulse = Math.round(readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length);

  const maxSystolic = Math.max(...readings.map((r) => r.systolic));
  const minSystolic = Math.min(...readings.map((r) => r.systolic));

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 mb-6">
      <div className="stat-card">
        <div className="stat-label">{isNarrow ? 'Átl. sys' : 'Átl. szisztolés'}</div>
        <div className="stat-value">{avgSystolic}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">{isNarrow ? 'Átl. dia' : 'Átl. diasztolés'}</div>
        <div className="stat-value">{avgDiastolic}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">{isNarrow ? 'Átl. pul' : 'Átl. pulzus'}</div>
        <div className="stat-value">{avgPulse}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">{isNarrow ? 'Tart.' : 'Tartomány'}</div>
        <div className="stat-value">
          {minSystolic}–{maxSystolic}
        </div>
      </div>
    </div>
  );
}
