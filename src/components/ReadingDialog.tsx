import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import type { BloodPressureReading } from '../types/reading';

interface ReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (reading: Omit<BloodPressureReading, 'id'>) => void;
  editingReading?: BloodPressureReading | null;
  onEditingChange?: (reading: BloodPressureReading | null) => void;
  disabled?: boolean;
}

export function ReadingDialog({ open, onOpenChange, onAdd, editingReading, onEditingChange, disabled = false }: ReadingDialogProps) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (editingReading) {
      setSystolic(editingReading.systolic.toString());
      setDiastolic(editingReading.diastolic.toString());
      setPulse(editingReading.pulse.toString());
      setNotes(editingReading.notes || '');
      const date = new Date(editingReading.timestamp);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setTimestamp(date.toISOString().slice(0, 16));
      onOpenChange(true);
    }
  }, [editingReading, onOpenChange]);

  const handleClose = () => {
    onEditingChange?.(null);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (systolic && diastolic && pulse) {
      onAdd({
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: parseInt(pulse),
        timestamp: new Date(timestamp),
        notes: notes || undefined,
      });
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setTimestamp(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
      });
      setNotes('');
      handleClose();
    }
  };

  return (
    <>
      {open && (
        <div className="overlay">
          <div className="modal">
            <h2 className="modal-title">{editingReading ? 'Mérés szerkesztése' : 'Új mérés'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Szisztolés</label>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Diasztolés</label>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Pulzus</label>
                <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="72" className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Dátum és idő</label>
                <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Megjegyzések (opcionális)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bármilyen megjegyzés..."
                  className="form-input"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Mégse
                </button>
                <button type="submit" className="btn-primary">
                  Mentés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
