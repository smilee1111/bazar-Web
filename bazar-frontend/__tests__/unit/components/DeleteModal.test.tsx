import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteModal from '@/components/modals/DeleteModal';

describe('DeleteModal Component', () => {
    const mockOnConfirm = jest.fn();
    const mockOnClose = jest.fn();

    const defaultProps = {
        isOpen: true,
        title: 'Delete Item',
        description: 'Are you sure you want to delete this item?',
        onConfirm: mockOnConfirm,
        onClose: mockOnClose,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. should render modal when isOpen is true', () => {
        render(<DeleteModal {...defaultProps} />);
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    test('2. should not render modal when isOpen is false', () => {
        render(<DeleteModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });

    test('3. should display the description text', () => {
        render(<DeleteModal {...defaultProps} />);
        expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    test('4. should call onConfirm when delete button is clicked', async () => {
        render(<DeleteModal {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        const deleteButton = buttons[buttons.length - 1]; // Last button is usually delete
        fireEvent.click(deleteButton);
        expect(mockOnConfirm).toHaveBeenCalled();
    });

    test('5. should call onClose when cancel button is clicked', async () => {
        render(<DeleteModal {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        const cancelButton = buttons[0]; // First button is usually cancel
        fireEvent.click(cancelButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('6. should have both cancel and confirm buttons', () => {
        render(<DeleteModal {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    test('7. should render title text', () => {
        render(<DeleteModal {...defaultProps} />);
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    test('8. should render description text', () => {
        render(<DeleteModal {...defaultProps} />);
        expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    test('9. should handle custom title text', () => {
        const customTitle = 'Confirm Deletion';
        render(<DeleteModal {...defaultProps} title={customTitle} />);
        expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    test('10. should not call callbacks when not clicking buttons', () => {
        render(<DeleteModal {...defaultProps} />);
        expect(mockOnConfirm).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
