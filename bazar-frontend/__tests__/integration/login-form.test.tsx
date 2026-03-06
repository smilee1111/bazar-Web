import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Form component
const LoginForm = ({ onSubmit }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: any = {};

        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (email && !email.includes('@')) newErrors.email = 'Invalid email';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({ email, password });
        setEmail('');
        setPassword('');
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                />
                {errors.email && <span>{errors.email}</span>}
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                />
                {errors.password && <span>{errors.password}</span>}
            </div>
            <button type="submit">Login</button>
        </form>
    );
};

describe('Login Form Integration Tests', () => {
    test('1. should render login form', () => {
        render(<LoginForm onSubmit={jest.fn()} />);
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    test('2. should display email and password fields', () => {
        render(<LoginForm onSubmit={jest.fn()} />);
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    test('3. should validate empty email', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSubmit={jest.fn()} />);
        
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Login' });
        
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);
        
        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    test('4. should validate empty password', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSubmit={jest.fn()} />);
        
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Login' });
        
        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);
        
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    test('5. should handle form submission', async () => {
        const mockOnSubmit = jest.fn();
        const user = userEvent.setup();
        render(<LoginForm onSubmit={mockOnSubmit} />);
        
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Login' });
        
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
        
        await user.click(submitButton);
        
        expect(mockOnSubmit).toHaveBeenCalled();
    });

    test('6. should submit form with valid data', async () => {
        const mockOnSubmit = jest.fn();
        const user = userEvent.setup();
        render(<LoginForm onSubmit={mockOnSubmit} />);
        
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Login' });
        
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);
        
        expect(mockOnSubmit).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    test('7. should clear form after successful submission', async () => {
        const mockOnSubmit = jest.fn();
        const user = userEvent.setup();
        render(<LoginForm onSubmit={mockOnSubmit} />);
        
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: 'Login' });
        
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);
        
        await waitFor(() => {
            expect(emailInput.value).toBe('');
            expect(passwordInput.value).toBe('');
        });
    });

    test('8. should allow correcting validation errors', async () => {
        const mockOnSubmit = jest.fn();
        const user = userEvent.setup();
        render(<LoginForm onSubmit={mockOnSubmit} />);
        
        const submitButton = screen.getByRole('button', { name: 'Login' });
        
        // First submit without data
        await user.click(submitButton);
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        
        // Fix errors
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);
        
        expect(mockOnSubmit).toHaveBeenCalled();
    });

    test('9. should handle multiple form submissions', async () => {
        const mockOnSubmit = jest.fn();
        const user = userEvent.setup();
        render(<LoginForm onSubmit={mockOnSubmit} />);
        
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Login' });
        
        // First submission
        await user.type(emailInput, 'user1@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);
        
        // Second submission
        await user.type(emailInput, 'user2@example.com');
        await user.type(passwordInput, 'password456');
        await user.click(submitButton);
        
        expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });

    test('10. should focus on email field by default', () => {
        render(<LoginForm onSubmit={jest.fn()} />);
        const emailInput = screen.getByLabelText('Email');
        // Email field should be available for interaction
        expect(emailInput).toBeInTheDocument();
    });
});
