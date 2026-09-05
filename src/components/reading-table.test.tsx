// @vitest-environment happy-dom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReadingTable } from './ReadingTable';
import { getReadingLevel } from '../utils/blood-pressure-level';
import { i18n } from '../i18n/hu';
import type { BloodPressureReading } from '../types/reading';

vi.mock('../hooks/use-narrow', () => ({ useNarrow: () => false }));

const reading = (overrides: Partial<BloodPressureReading> = {}): BloodPressureReading => ({
  id: 'r1',
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  timestamp: new Date('2026-01-15T10:00:00'),
  ...overrides,
});

const defaultProps = {
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe('ReadingTable', () => {
  it('shows empty-state cell when there are no readings', () => {
    render(<ReadingTable {...defaultProps} readings={[]} />);
    expect(screen.getByText('Nincsenek mérések')).toBeInTheDocument();
  });

  it('renders rows in reverse chronological order', () => {
    const readings = [
      reading({ id: 'r1', systolic: 110, timestamp: new Date('2026-01-01') }),
      reading({ id: 'r2', systolic: 130, timestamp: new Date('2026-01-02') }),
    ];
    render(<ReadingTable {...defaultProps} readings={readings} />);
    const rows = screen.getAllByRole('row').slice(1); // skip header
    expect(within(rows[0]).getByText('130')).toBeInTheDocument();
    expect(within(rows[1]).getByText('110')).toBeInTheDocument();
  });

  it('applies the correct bp-level CSS class to systolic and diastolic cells', () => {
    const r = reading({ systolic: 160, diastolic: 50 });
    render(<ReadingTable {...defaultProps} readings={[r]} />);
    expect(document.querySelector(`.bp-${getReadingLevel('systolic', 160)}`)).toBeInTheDocument();
    expect(document.querySelector(`.bp-${getReadingLevel('diastolic', 50)}`)).toBeInTheDocument();
  });

  describe('delete flow', () => {
    it('opens confirm dialog when delete is clicked', async () => {
      render(<ReadingTable {...defaultProps} readings={[reading()]} />);
      await userEvent.click(screen.getByRole('button', { name: i18n.actions.delete }));
      expect(screen.getByText(i18n.confirm.deleteTitle)).toBeInTheDocument();
    });

    it('calls onDelete with the correct id after confirming', async () => {
      const onDelete = vi.fn();
      render(<ReadingTable {...defaultProps} readings={[reading({ id: 'r1' })]} onDelete={onDelete} />);
      await userEvent.click(screen.getByRole('button', { name: i18n.actions.delete }));
      const modal = screen.getByText(i18n.confirm.deleteTitle).closest('.modal')!;
      await userEvent.click(within(modal as HTMLElement).getByRole('button', { name: i18n.actions.delete }));
      expect(onDelete).toHaveBeenCalledWith('r1');
    });

    it('does not call onDelete when the dialog is cancelled', async () => {
      const onDelete = vi.fn();
      render(<ReadingTable {...defaultProps} readings={[reading()]} onDelete={onDelete} />);
      await userEvent.click(screen.getByRole('button', { name: i18n.actions.delete }));
      await userEvent.click(screen.getByRole('button', { name: i18n.actions.cancel }));
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  it('calls onEdit with the reading when the edit button is clicked', async () => {
    const onEdit = vi.fn();
    const r = reading({ id: 'r1' });
    render(<ReadingTable {...defaultProps} readings={[r]} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: i18n.actions.edit }));
    expect(onEdit).toHaveBeenCalledWith(r);
  });
});
