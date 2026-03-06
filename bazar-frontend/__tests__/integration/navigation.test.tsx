import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Navigation component
const Navigation = ({ onNavigate }: any) => (
    <nav>
        <button onClick={() => onNavigate('home')}>Home</button>
        <button onClick={() => onNavigate('about')}>About</button>
        <button onClick={() => onNavigate('contact')}>Contact</button>
    </nav>
);

describe('Navigation Integration Tests', () => {
    test('1. should display all navigation links', () => {
        const mockNavigate = jest.fn();
        render(<Navigation onNavigate={mockNavigate} />);
        
        expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument();
    });

    test('2. should handle navigation to home', async () => {
        const mockNavigate = jest.fn();
        render(<Navigation onNavigate={mockNavigate} />);
        
        const homeButton = screen.getByRole('button', { name: 'Home' });
        fireEvent.click(homeButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('home');
    });

    test('3. should handle navigation to about', async () => {
        const mockNavigate = jest.fn();
        render(<Navigation onNavigate={mockNavigate} />);
        
        const aboutButton = screen.getByRole('button', { name: 'About' });
        fireEvent.click(aboutButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('about');
    });

    test('4. should handle navigation to contact', async () => {
        const mockNavigate = jest.fn();
        render(<Navigation onNavigate={mockNavigate} />);
        
        const contactButton = screen.getByRole('button', { name: 'Contact' });
        fireEvent.click(contactButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('contact');
    });

    test('5. should handle multiple navigation clicks', () => {
        const mockNavigate = jest.fn();
        render(<Navigation onNavigate={mockNavigate} />);
        
        fireEvent.click(screen.getByRole('button', { name: 'Home' }));
        fireEvent.click(screen.getByRole('button', { name: 'About' }));
        fireEvent.click(screen.getByRole('button', { name: 'Contact' }));
        
        expect(mockNavigate).toHaveBeenCalledTimes(3);
        expect(mockNavigate).toHaveBeenNthCalledWith(1, 'home');
        expect(mockNavigate).toHaveBeenNthCalledWith(2, 'about');
        expect(mockNavigate).toHaveBeenNthCalledWith(3, 'contact');
    });
});
