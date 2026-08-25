import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useNarrow } from '../hooks/use-narrow';
import type { BloodPressureReading } from '../types/reading';
import { getReadingLevel } from '../utils/blood-pressure-level';
import { DeleteConfirmDialog } from './ConfirmDialog';

interface ReadingTableProps {
  readings: BloodPressureReading[];
  onDelete: (id: string) => void;
  onEdit: (reading: BloodPressureReading) => void;
  disabled?: boolean;
}

export function ReadingTable({ readings, onDelete, onEdit, disabled = false }: ReadingTableProps) {
  const isNarrow = useNarrow();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const emptyState = (
    <tr>
      <td colSpan={isNarrow ? 5 : 6} className="table-cell table-empty">
        Nincs mérés
      </td>
    </tr>
  );

  const readingRows = [...readings].reverse().map((reading) => {
    return (
      <tr key={reading.id} className="table-row">
        <td className="table-cell-date">{format(reading.timestamp, isNarrow ? 'MMM d' : 'yyyy. MMM dd.', { locale: hu })}</td>
        <td className={`table-cell bp-${getReadingLevel('systolic', reading.systolic)}`}>{reading.systolic}</td>
        <td className={`table-cell bp-${getReadingLevel('diastolic', reading.diastolic)}`}>{reading.diastolic}</td>
        <td className="table-cell">{reading.pulse}</td>
        {!isNarrow && <td className="table-cell-muted">{reading.notes || '—'}</td>}
        <td className="table-cell-center">
          <div className="table-cell-actions">
            <button onClick={() => onEdit(reading)} className="btn-edit" disabled={disabled}>
              <Edit2 size={18} />
            </button>
            <button onClick={() => handleDeleteClick(reading.id)} className="btn-delete" disabled={disabled}>
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  });

  return (
    <>
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
          <tbody>{readings.length === 0 ? emptyState : readingRows}</tbody>
        </table>
      </div>
      <DeleteConfirmDialog open={deleteConfirm !== null} onConfirm={handleConfirmDelete} onCancel={() => setDeleteConfirm(null)} />
    </>
  );
}
