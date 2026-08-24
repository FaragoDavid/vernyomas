import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

import type { BloodPressureReading } from '../types/reading';

interface ReadingTableProps {
  readings: BloodPressureReading[];
  onDelete: (id: string) => void;
  onEdit: (reading: BloodPressureReading) => void;
}

export function ReadingTable({ readings, onDelete, onEdit }: ReadingTableProps) {
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="table-card">
      <table>
        <thead>
          <tr className="table-header-row">
            <th className="table-header-cell">Dátum</th>
            <th className="table-header-cell">Szisztolés</th>
            <th className="table-header-cell">Diasztolés</th>
            <th className="table-header-cell">Pulzus</th>
            {!isNarrow && <th className="table-header-cell">Megjegyzések</th>}
            <th className="table-header-cell table-cell-center"></th>
          </tr>
        </thead>
        <tbody>
          {readings.length === 0 ? (
            <tr>
              <td colSpan={isNarrow ? 5 : 6} className="table-cell table-empty">
                Nincs mérés
              </td>
            </tr>
          ) : (
            readings.map((reading) => (
              <tr key={reading.id} className="table-row">
                <td className="table-cell-date">{format(reading.timestamp, isNarrow ? 'MMM d' : 'PPPP', { locale: hu })}</td>
                <td className="table-cell">{reading.systolic}</td>
                <td className="table-cell">{reading.diastolic}</td>
                <td className="table-cell">{reading.pulse}</td>
                {!isNarrow && <td className="table-cell-muted">{reading.notes || '—'}</td>}
                <td className="table-cell-center">
                  <div className="table-cell-actions">
                    <button onClick={() => onEdit(reading)} className="btn-edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => onDelete(reading.id)} className="btn-delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
