import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock services và hooks
vi.mock('@/services/user.services', () => ({
  loginService: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const setup = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders login form properly', () => {
    setup();
    expect(screen.getByText('Account Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('calls loginService on valid form submission', async () => {
    const { loginService } = await import('@/services/user.services');
    (loginService as any).mockResolvedValue({
      data: {
        result: {
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token'
        }
      }
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: '123456' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(loginService).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456'
      });
    });

    expect(localStorage.getItem('access_token')).toBe('fake-access-token');
  });

  it('displays error toast if login fails', async () => {
    const { loginService } = await import('@/services/user.services');
    (loginService as any).mockRejectedValue({
      response: {
        data: { message: 'Invalid credentials' }
      }
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpass' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
