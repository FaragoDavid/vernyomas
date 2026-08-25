import { isSameMonth, subMonths } from 'date-fns';
import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import Login from './components/Login';
import { ReadingDialog } from './components/ReadingDialog';
import { ReadingTable } from './components/ReadingTable';
import { StatsStrip } from './components/StatsStrip';
import { TrendChart } from './components/TrendChart';
import { useStore } from './data/store';
import { useNarrow } from './hooks/use-narrow';
import { useAuth } from './services/auth';
import type { BloodPressureReading } from './types/reading';

type ChartView = 'systolic' | 'diastolic' | 'pulse';

function App() {
  const user = useAuth();
  const store = useStore();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chartView, setChartView] = useState<ChartView>('systolic');
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null);
  const [targetMonth, setTargetMonth] = useState(new Date());
  const isNarrow = useNarrow();

  const loadReadings = async () => {
    setLoading(true);
    const data = await store.readReadings();
    setReadings(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const data = await store.readReadings();
    setReadings(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadReadings();
  }, [store]);

  const handleSaveReading = async (reading: Omit<BloodPressureReading, 'id'>) => {
    if (editingReading) {
      await store.updateReading({ ...reading, id: editingReading.id });
      setEditingReading(null);
    } else {
      await store.addReading(reading);
    }
    const data = await store.readReadings();
    setReadings(data);
  };

  const handleDeleteReading = async (id: string) => {
    await store.deleteReading(id);
    setReadings((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditReading = (reading: BloodPressureReading) => {
    setEditingReading(reading);
    setDialogOpen(true);
  };

  const canGoPrev = readings.some((r) => isSameMonth(subMonths(targetMonth, 1), r.timestamp));

  if (user === null) return <Login />;

  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">Vérnyomás</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleRefresh} disabled={refreshing} className="btn-refresh" title="Frissítés">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setDialogOpen(true)} className="btn-primary" title="Új mérés" disabled={refreshing}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-cream-100 py-12">Betöltés...</div>
        ) : (
          <>
            {dialogOpen && (
              <ReadingDialog
                title={editingReading ? 'Mérés szerkesztése' : 'Új mérés'}
                initialReading={editingReading ?? undefined}
                onAdd={handleSaveReading}
                onClose={() => {
                  setDialogOpen(false);
                  setEditingReading(null);
                }}
                disabled={refreshing}
              />
            )}
            <StatsStrip readings={readings} />

            <div className="card">
              <div className="chart-controls">
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
                  <button className="chart-month-btn" onClick={() => setTargetMonth(subMonths(targetMonth, 1))} disabled={!canGoPrev}>
                    ←
                  </button>
                  <button
                    className="chart-month-btn"
                    onClick={() => setTargetMonth(new Date())}
                    disabled={isSameMonth(targetMonth, new Date())}
                  >
                    Ma
                  </button>
                  <button
                    className="chart-month-btn"
                    onClick={() => setTargetMonth(subMonths(targetMonth, -1))}
                    disabled={isSameMonth(targetMonth, new Date())}
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="chart-body">
                <TrendChart
                  readings={readings}
                  readingType={chartView}
                  targetMonth={targetMonth}
                  slidingWindowSize={parseInt(import.meta.env.VITE_CHART_SLIDING_WINDOW_SIZE || '10')}
                />
                <div className="chart-month-label">
                  {targetMonth.toLocaleString('hu', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            </div>

            <ReadingTable readings={readings} onDelete={handleDeleteReading} onEdit={handleEditReading} disabled={refreshing} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
