/**
 * LoginForm Component Tests
 * Unit tests for authentication form component
 * Requirements: 10.4
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { gql } from '@apollo/client';
import { LoginForm } from '@/components/auth/LoginForm';
import { renderWithProviders, createGraphQLMock } from '../../utils/test-utils';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      user {
        id
        email
        firstName
        lastName
      }
      tokens {
        accessToken
        refreshToken
        expiresAt
      }
    }
  }
`;

describe('LoginForm', () => {
  const user = userEvent.setup();

  it('renders login form with email and password fields', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const mockResponse = {
      login: {
        success: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date().toISOString(),
        },
      },
    };

    const mocks = [
      createGraphQLMock(LOGIN_MUTATION, {
        email: 'test@example.com',
        password: 'password123',
      }, mockResponse),
    ];

    renderWithProviders(<LoginForm />, { mocks });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });

  it('handles login errors gracefully', async () => {
    const mocks = [
      createGraphQLMock(
        LOGIN_MUTATION,
        {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
        {},
        new Error('Invalid credentials')
      ),
    ];

    renderWithProviders(<LoginForm />, { mocks });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const mocks = [
      createGraphQLMock(LOGIN_MUTATION, {
        email: 'test@example.com',
        password: 'password123',
      }, {
        login: {
          success: true,
          user: { id: 'user-1', email: 'test@example.com' },
          tokens: { accessToken: 'token' },
        },
      }),
    ];

    renderWithProviders(<LoginForm />, { mocks });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(submitButton).not.toBeDisabled();
    
    await user.click(submitButton);
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});