import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');
const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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
  mockNavigate.mockReset();
  localStorage.clear();
});

describe('LoginPage', () => {
  it('renders the login form fields and submit button', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('disables submit until both required fields are filled', async () => {
    renderLoginPage();

    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });

  it('shows validation errors and does not call the API for invalid input', async () => {
    renderLoginPage();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows a validation error when the email format is invalid', async () => {
    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('stores the token and navigates on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'jwt-abc' });

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('jwt-abc');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows the invalid credentials error on 401', async () => {
    const error = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    });
    mockLogin.mockRejectedValueOnce(error);

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the generic error on server failure', async () => {
    const error = Object.assign(new Error('Server Error'), {
      isAxiosError: true,
      response: { status: 500 },
    });
    mockLogin.mockRejectedValueOnce(error);

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong. Please try again later.'
      );
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
