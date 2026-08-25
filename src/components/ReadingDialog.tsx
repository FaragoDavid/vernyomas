import React, { useState } from 'react';

import type { BloodPressureReading } from '../types/reading';

interface ReadingDialogProps {
  title: string;
  initialReading?: BloodPressureReading;
  onAdd: (reading: Omit<BloodPressureReading, 'id'>) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function ReadingDialog({ title, initialReading, onAdd, onClose, disabled = false }: ReadingDialogProps) {
  const [systolic, setSystolic] = useState(initialReading?.systolic.toString() ?? '');
  const [diastolic, setDiastolic] = useState(initialReading?.diastolic.toString() ?? '');
  const [pulse, setPulse] = useState(initialReading?.pulse.toString() ?? '');
  const [timestamp, setTimestamp] = useState(() => {
    if (initialReading) {
      const date = new Date(initialReading.timestamp);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState(initialReading?.notes ?? '');

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
      onClose();
    }
  };

  return (
    <div className="overlay">
      <div className="modal">
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Szisztolés</label>
            <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} placeholder="120" className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Diasztolés</label>
            <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} placeholder="80" className="form-input" />
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
            <button type="button" onClick={onClose} className="btn-secondary" disabled={disabled}>
              Mégse
            </button>
            <button type="submit" className="btn-primary" disabled={disabled}>
              Mentés
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
