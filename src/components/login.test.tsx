// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Login from './Login';
import { i18n } from '../i18n/hu';

const mockSignIn = vi.fn();
vi.mock('../services/auth', () => ({ signIn: (...args: unknown[]) => mockSignIn(...args) }));

describe('Login', () => {
  it('renders the sign-in button', () => {
    render(<Login />);
    expect(screen.getByText(i18n.login.googleButton)).toBeInTheDocument();
  });

  it('calls signIn when the button is clicked', async () => {
    mockSignIn.mockResolvedValue(undefined);
    render(<Login />);
    await userEvent.click(screen.getByText(i18n.login.googleButton));
    expect(mockSignIn).toHaveBeenCalledOnce();
  });
});
