import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import Login from './components/Login';
import { ReadingDialog } from './components/ReadingDialog';
import { ReadingTable } from './components/ReadingTable';
import { StatsStrip } from './components/StatsStrip';
import { TrendChart } from './components/TrendChart';
import { useStore } from './data/store';
import { useAuth } from './services/auth';
import type { BloodPressureReading } from './types/reading';

type ChartView = 'systolic' | 'diastolic' | 'pulse';

function App() {
  const user = useAuth();
  const store = useStore();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<ChartView>('systolic');
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null);
  const [chartMonthOffset, setChartMonthOffset] = useState(0);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 640);

  useEffect(() => {
    const loadReadings = async () => {
      setLoading(true);
      const data = await store.readReadings();
      setReadings(data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setLoading(false);
    };

    loadReadings();
  }, [store]);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddReading = async (reading: Omit<BloodPressureReading, 'id'>) => {
    if (editingReading) {
      const updated = { ...reading, id: editingReading.id };
      await store.updateReading(updated as BloodPressureReading);
      setReadings((prev) =>
        prev.map((r) => (r.id === editingReading.id ? updated : r)).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      );
      setEditingReading(null);
    } else {
      const id = await store.addReading(reading);
      setReadings((prev) => [{ ...reading, id }, ...prev].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }
  };

  const handleDeleteReading = async (id: string) => {
    await store.deleteReading(id);
    setReadings((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditReading = (reading: BloodPressureReading) => {
    setEditingReading(reading);
  };

  const maxMonthOffset =
    readings.length > 0
      ? Math.floor(
          (new Date().getFullYear() * 12 +
            new Date().getMonth() -
            (readings[readings.length - 1].timestamp.getFullYear() * 12 + readings[readings.length - 1].timestamp.getMonth())) /
            1,
        )
      : 0;

  if (user === null) return <Login />;

  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">Vérnyomás</h1>
          </div>
          <ReadingDialog onAdd={handleAddReading} editingReading={editingReading} onEditingChange={setEditingReading} />
        </div>

        {loading ? (
          <div className="text-center text-cream-100 py-12">Betöltés...</div>
        ) : (
          <>
            <StatsStrip readings={readings} />

            <div className="card">
              <div className="chart-tabs">
                <div className="chart-selectors">
                  {(['systolic', 'diastolic', 'pulse'] as ChartView[]).map((view) => (
                    <button key={view} onClick={() => setChartView(view)} className={chartView === view ? 'tab-btn-active' : 'tab-btn'}>
                      {isNarrow
                        ? view === 'systolic'
                          ? 'Sys'
                          : view === 'diastolic'
                            ? 'Dia'
                            : 'Pul'
                        : view === 'systolic'
                          ? 'Szisztolés'
                          : view === 'diastolic'
                            ? 'Diasztolés'
                            : 'Pulzus'}
                    </button>
                  ))}
                </div>
                <div className="chart-month-nav">
                  <button
                    className="chart-month-btn"
                    onClick={() => setChartMonthOffset((prev) => Math.min(prev + 1, maxMonthOffset))}
                    disabled={chartMonthOffset >= maxMonthOffset}
                  >
                    ←
                  </button>
                  <button className="chart-month-btn" onClick={() => setChartMonthOffset(0)} disabled={chartMonthOffset === 0}>
                    Ma
                  </button>
                  <button
                    className="chart-month-btn"
                    onClick={() => setChartMonthOffset((prev) => Math.max(0, prev - 1))}
                    disabled={chartMonthOffset === 0}
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="chart-body">
                <TrendChart
                  readings={readings}
                  type={chartView}
                  monthOffset={chartMonthOffset}
                  slidingWindowSize={parseInt(import.meta.env.VITE_CHART_SLIDING_WINDOW_SIZE || '10')}
                />
                <div className="chart-month-label">
                  {new Date(new Date().getFullYear(), new Date().getMonth() - chartMonthOffset, 1).toLocaleString('hu', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            </div>

            <ReadingTable readings={readings} onDelete={handleDeleteReading} onEdit={handleEditReading} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
