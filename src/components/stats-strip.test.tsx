// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { StatsStrip } from './StatsStrip';
import type { BloodPressureReading } from '../types/reading';

vi.mock('../hooks/use-narrow', () => ({ useNarrow: () => false }));

const reading = (overrides: Partial<BloodPressureReading> = {}): BloodPressureReading => ({
  id: '1',
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  timestamp: new Date('2026-01-01'),
  ...overrides,
});

describe('StatsStrip', () => {
  it('renders nothing for an empty array', () => {
    const { container } = render(<StatsStrip readings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the reading value itself as average for a single reading', () => {
    render(<StatsStrip readings={[reading({ systolic: 130, diastolic: 85, pulse: 65 })]} />);
    expect(screen.getByText('130')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  it('shows correctly rounded averages and min–max range for multiple readings', () => {
    const readings = [
      reading({ id: '1', systolic: 120, diastolic: 80, pulse: 70 }),
      reading({ id: '2', systolic: 130, diastolic: 90, pulse: 80 }),
      reading({ id: '3', systolic: 125, diastolic: 85, pulse: 75 }),
    ];
    render(<StatsStrip readings={readings} />);
    expect(screen.getByText('125')).toBeInTheDocument(); // avg systolic
    expect(screen.getByText('85')).toBeInTheDocument(); // avg diastolic
    expect(screen.getByText('75')).toBeInTheDocument(); // avg pulse
    expect(screen.getByText('120–130')).toBeInTheDocument(); // min–max systolic
  });
});
