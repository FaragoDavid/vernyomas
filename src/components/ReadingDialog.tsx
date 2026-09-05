import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

import { i18n } from '../i18n/hu';
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
  const [timestamp, setTimestamp] = useState<number>(initialReading?.timestamp.getTime() ?? Date.now());
  const [notes, setNotes] = useState(initialReading?.notes ?? '');
  const [isDirty, setIsDirty] = useState(!initialReading);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.SyntheticEvent) => {
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
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div id="field-systolic" className="form-field">
            <label htmlFor="systolic" className="form-label">
              {i18n.dialog.systolic}
            </label>
            <input
              id="systolic"
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              placeholder="120"
              className="form-input"
            />
          </div>
          <div id="field-diastolic" className="form-field">
            <label htmlFor="diastolic" className="form-label">
              {i18n.dialog.diastolic}
            </label>
            <input
              id="diastolic"
              type="number"
              value={diastolic}
              onChange={(e) => {
                setIsDirty(true);
                setDiastolic(e.target.value);
              }}
              placeholder="80"
              className="form-input"
            />
          </div>
          <div id="field-pulse" className="form-field">
            <label htmlFor="pulse" className="form-label">
              {i18n.dialog.pulse}
            </label>
            <input
              id="pulse"
              type="number"
              value={pulse}
              onChange={(e) => {
                setIsDirty(true);
                setPulse(e.target.value);
              }}
              placeholder="72"
              className="form-input"
            />
          </div>
          <div id="field-timestamp" className="form-field">
            <label htmlFor="timestamp" className="form-label">
              {i18n.dialog.datetime}
            </label>
            <input
              id="timestamp"
              type="datetime-local"
              value={format(new Date(timestamp), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => {
                setIsDirty(true);
                setTimestamp(new Date(e.target.value).getTime());
              }}
              className="form-input"
            />
          </div>
          <div id="field-notes" className="form-field">
            <label htmlFor="notes" className="form-label">
              {i18n.dialog.notes}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setIsDirty(true);
                setNotes(e.target.value);
              }}
              placeholder={i18n.dialog.notesPlaceholder}
              className="form-input"
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={disabled}>
              {i18n.actions.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={!isDirty || !systolic || !diastolic || !pulse || disabled}>
              {i18n.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
