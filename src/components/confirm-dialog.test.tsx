// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DeleteConfirmDialog } from './ConfirmDialog';
import { i18n } from '../i18n/hu';

describe('DeleteConfirmDialog', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<DeleteConfirmDialog open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and message when open is true', () => {
    render(<DeleteConfirmDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(i18n.confirm.deleteTitle)).toBeInTheDocument();
    expect(screen.getByText(i18n.confirm.deleteMessage)).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmDialog open={true} onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByText(i18n.actions.cancel));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmDialog open={true} onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText(i18n.actions.delete));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
