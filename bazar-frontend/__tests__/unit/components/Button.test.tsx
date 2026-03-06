import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock UI Button component
const Button = ({ children, ...rest }: any) => <button {...rest}>{children}</button>;

describe('UI Components - Button', () => {
    test('1. should render button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    test('2. should handle onClick event', () => {
        const mockClick = jest.fn();
        render(<Button onClick={mockClick}>Click</Button>);
        
        const button = screen.getByRole('button');
        button.click();
        
        expect(mockClick).toHaveBeenCalledTimes(1);
    });

    test('3. should support disabled state', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    test('4. should support className prop', () => {
        render(<Button className="custom-class">Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    test('5. should support type attribute', () => {
        const { container } = render(<Button type="submit">Submit</Button>);
        const button = container.querySelector('button[type="submit"]');
        expect(button).toBeInTheDocument();
    });

    test('6. should render with variant styling', () => {
        render(<Button className="btn-primary">Primary</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-primary');
    });

    test('7. should support size variants', () => {
        render(<Button className="btn-lg">Large Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-lg');
    });

    test('8. should handle multiple onClick calls', () => {
        const mockClick = jest.fn();
        const { rerender } = render(<Button onClick={mockClick}>Button</Button>);
        
        let button = screen.getByRole('button');
        button.click();
        button.click();
        
        expect(mockClick).toHaveBeenCalledTimes(2);
    });

    test('9. should not be clickable when disabled', () => {
        const mockClick = jest.fn();
        render(
            <Button disabled onClick={mockClick}>
                Disabled
            </Button>
        );
        
        const button = screen.getByRole('button');
        button.click();
        
        expect(mockClick).not.toHaveBeenCalled();
    });

    test('10. should support aria attributes', () => {
        render(<Button aria-label="Close modal">×</Button>);
        const button = screen.getByLabelText('Close modal');
        expect(button).toBeInTheDocument();
    });
});
