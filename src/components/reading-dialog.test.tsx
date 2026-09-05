// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReadingDialog } from './ReadingDialog';
import { i18n } from '../i18n/hu';
import type { BloodPressureReading } from '../types/reading';

const existingReading: BloodPressureReading = {
  id: 'r1',
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  timestamp: new Date('2026-01-15T10:30:00'),
};

const defaultProps = {
  title: i18n.actions.newReading,
  onAdd: vi.fn(),
  onClose: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe('ReadingDialog', () => {
  describe('new reading mode', () => {
    it('renders with empty fields', () => {
      render(<ReadingDialog {...defaultProps} />);
      expect(screen.getByLabelText(i18n.dialog.systolic)).toHaveValue(null);
      expect(screen.getByLabelText(i18n.dialog.diastolic)).toHaveValue(null);
      expect(screen.getByLabelText(i18n.dialog.pulse)).toHaveValue(null);
    });

    it('Save is disabled until all three numeric fields are filled', async () => {
      render(<ReadingDialog {...defaultProps} />);
      const save = screen.getByText(i18n.actions.save);
      expect(save).toBeDisabled();

      await userEvent.type(screen.getByLabelText(i18n.dialog.systolic), '130');
      expect(save).toBeDisabled();

      await userEvent.type(screen.getByLabelText(i18n.dialog.diastolic), '85');
      expect(save).toBeDisabled();

      await userEvent.type(screen.getByLabelText(i18n.dialog.pulse), '75');
      expect(save).toBeEnabled();
    });

    it('calls onAdd with parsed integers and onClose on submit', async () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();
      render(<ReadingDialog {...defaultProps} onAdd={onAdd} onClose={onClose} />);

      await userEvent.type(screen.getByLabelText(i18n.dialog.systolic), '130');
      await userEvent.type(screen.getByLabelText(i18n.dialog.diastolic), '85');
      await userEvent.type(screen.getByLabelText(i18n.dialog.pulse), '75');
      await userEvent.click(screen.getByText(i18n.actions.save));

      expect(onAdd).toHaveBeenCalledWith({ systolic: 130, diastolic: 85, pulse: 75, timestamp: expect.any(Date), notes: undefined });
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('edit mode', () => {
    it('pre-fills fields from initialReading', () => {
      render(<ReadingDialog {...defaultProps} initialReading={existingReading} />);
      expect(screen.getByLabelText(i18n.dialog.systolic)).toHaveValue(existingReading.systolic);
      expect(screen.getByLabelText(i18n.dialog.diastolic)).toHaveValue(existingReading.diastolic);
      expect(screen.getByLabelText(i18n.dialog.pulse)).toHaveValue(existingReading.pulse);
    });

    it('Save is disabled initially and enabled after a field is changed', async () => {
      render(<ReadingDialog {...defaultProps} initialReading={existingReading} />);
      const save = screen.getByText(i18n.actions.save);
      expect(save).toBeDisabled();

      const diastolicInput = screen.getByLabelText(i18n.dialog.diastolic);
      await userEvent.type(diastolicInput, '82');
      expect(save).toBeEnabled();
    });
  });

  describe('interactions', () => {
    it('calls onClose when Escape is pressed', async () => {
      const onClose = vi.fn();
      render(<ReadingDialog {...defaultProps} onClose={onClose} />);
      await userEvent.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when the overlay is clicked', async () => {
      const onClose = vi.fn();
      render(<ReadingDialog {...defaultProps} onClose={onClose} />);
      await userEvent.click(document.querySelector('.overlay')!);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('does not call onClose when the modal itself is clicked', async () => {
      const onClose = vi.fn();
      render(<ReadingDialog {...defaultProps} onClose={onClose} />);
      await userEvent.click(document.querySelector('.modal')!);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
