/**
 * MAD-3 — aria-invalid regression tests
 * Covers: the bug fix (inverted ternary) + edge cases for ARIA state.
 * Pre-existing tests in LoginPage.test.tsx are NOT modified.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');
const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

describe('MAD-3 — aria-invalid on email field', () => {
  // ── BUG FIX TEST ──────────────────────────────────────────────────────────
  describe('Bug fix: inverted ternary', () => {
    it('should set aria-invalid="true" when a validation error is shown (was "false" before fix)', async () => {
      renderLoginPage();
      await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true');
    });
  });

  // ── REGRESSION TESTS ──────────────────────────────────────────────────────
  describe('Regression: aria-invalid state transitions', () => {
    it('should set aria-invalid="false" on initial render (no error)', () => {
      renderLoginPage();
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('should set aria-invalid="false" after a valid email is entered', async () => {
      renderLoginPage();
      await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // validateEmail passes → emailError stays null → aria-invalid="false"
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('should clear aria-invalid to "false" when the user starts retyping after an error', async () => {
      renderLoginPage();
      // Trigger error
      await userEvent.type(screen.getByLabelText(/email address/i), 'bad');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true');

      // onChange clears emailError → aria-invalid should return to "false"
      await userEvent.type(screen.getByLabelText(/email address/i), 'x');
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'false');
    });
  });

  // ── EDGE CASES ────────────────────────────────────────────────────────────
  describe('Edge cases', () => {
    it('should keep aria-invalid="false" when email contains only spaces (button stays disabled — no submit)', async () => {
      // isFormValid trims both fields; spaces-only email → button disabled → validateEmail never runs
      renderLoginPage();
      await userEvent.type(screen.getByLabelText(/email address/i), '   ');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');

      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('should set aria-invalid="true" for an email missing the domain', async () => {
      renderLoginPage();
      await userEvent.type(screen.getByLabelText(/email address/i), 'user@');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-invalid="false" after a successful login (no email error)', async () => {
      mockLogin.mockResolvedValueOnce({ token: 'tok' });
      renderLoginPage();
      await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => expect(mockLogin).toHaveBeenCalled());
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
