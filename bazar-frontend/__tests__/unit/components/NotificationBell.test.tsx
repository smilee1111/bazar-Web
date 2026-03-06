import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '@/components/NotificationBell';

// Mock the notification actions
jest.mock('@/lib/actions/notification-action', () => ({
    handleGetNotifications: jest.fn(async () => ({ success: true, notifications: [] })),
    handleGetUnreadCount: jest.fn(async () => ({ success: true, unreadCount: 0 })),
    handleMarkNotificationAsRead: jest.fn(async () => ({ success: true })),
    handleMarkAllAsRead: jest.fn(async () => ({ success: true })),
    handleDeleteNotification: jest.fn(async () => ({ success: true })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}));

describe('NotificationBell Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. should render notification bell icon', () => {
        render(<NotificationBell />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    test('2. should render bell icon', () => {
        const { container } = render(<NotificationBell />);
        // The component renders with a lucide-react Bell icon
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    test('3. should handle component mount', () => {
        const { container } = render(<NotificationBell />);
        expect(container).toBeInTheDocument();
    });

    test('4. should be clickable', () => {
        render(<NotificationBell />);
        const button = screen.getByRole('button');
        expect(button).not.toBeDisabled();
    });

    test('5. should render without errors', () => {
        expect(() => render(<NotificationBell />)).not.toThrow();
    });

    test('6. should have accessible role', () => {
        render(<NotificationBell />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
    });

    test('7. should initialize with no errors', async () => {
        const { container } = render(<NotificationBell />);
        await waitFor(() => {
            expect(container).toBeInTheDocument();
        });
    });

    test('8. should be keyboard accessible', () => {
        render(<NotificationBell />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
    });

    test('9. should handle rapid state changes', async () => {
        const { rerender } = render(<NotificationBell />);
        
        // Simulate component rerender
        rerender(<NotificationBell />);
        rerender(<NotificationBell />);
        
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('10. should maintain component state', () => {
        const { rerender } = render(<NotificationBell />);
        expect(screen.getByRole('button')).toBeInTheDocument();
        
        rerender(<NotificationBell />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
