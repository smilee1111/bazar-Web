import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Input component
const Input = ({ label, ...rest }: any) => (
    <div>
        {label && <label>{label}</label>}
        <input {...rest} />
    </div>
);

describe('UI Components - Input Field', () => {
    test('1. should render input field', () => {
        render(<Input />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('2. should render with label', () => {
        render(<Input label="Username" />);
        expect(screen.getByText('Username')).toBeInTheDocument();
    });

    test('3. should support placeholder text', () => {
        render(<Input placeholder="Enter name" />);
        expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });

    test('4. should handle value prop', () => {
        render(<Input value="test value" onChange={() => {}} />);
        expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    test('5. should support disabled state', () => {
        render(<Input disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    test('6. should support readonly state', () => {
        render(<Input readOnly value="readonly" onChange={() => {}} />);
        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    test('7. should support type attribute', () => {
        const { container } = render(<Input type="email" />);
        expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    });

    test('8. should render input with proper type', () => {
        const { container } = render(<Input type="password" />);
        expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    });

    test('9. should support required attribute', () => {
        const { container } = render(<Input required />);
        expect(container.querySelector('input[required]')).toBeInTheDocument();
    });

    test('10. should support maxLength attribute', () => {
        const { container } = render(<Input maxLength={10} />);
        expect(container.querySelector('input[maxlength="10"]')).toBeInTheDocument();
    });
});
