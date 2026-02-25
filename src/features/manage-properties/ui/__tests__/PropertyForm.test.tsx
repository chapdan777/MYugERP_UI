import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertyForm } from '../PropertyForm';
import * as propertyHooks from '../../model/property.hooks';

// Mock child component
vi.mock('../PropertyValueList', () => ({
    PropertyValueList: () => <div data-testid="property-value-list">PropertyValueList Mock</div>
}));

describe('PropertyForm Integration', () => {
    const mockCreateProperty = vi.fn();
    const mockUpdateProperty = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(propertyHooks, 'useCreateProperty').mockReturnValue({
            createProperty: mockCreateProperty
        });

        vi.spyOn(propertyHooks, 'useUpdateProperty').mockReturnValue({
            updateProperty: mockUpdateProperty
        });
    });

    it('renders create form correctly', () => {
        render(<PropertyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText(/Название свойства/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Код свойства/i)).toBeInTheDocument();
        expect(screen.getByText(/Создать свойство/i)).toBeInTheDocument();
    });

    it('submits form with correct data when creating', async () => {
        render(<PropertyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        fireEvent.change(screen.getByLabelText(/Название свойства/i), { target: { value: 'New Prop' } });
        fireEvent.change(screen.getByLabelText(/Код свойства/i), { target: { value: 'new_prop' } });

        const submitBtn = screen.getByText(/Создать свойство/i);
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockCreateProperty).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Prop',
                code: 'new_prop',
                dataType: 'string'
            }));
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('renders edit form and PropertyValueList for select type', () => {
        const property = {
            id: 1,
            name: 'Edit Prop',
            code: 'edit_prop',
            dataType: 'select',
            isActive: true,
            possibleValues: []
        };

        render(<PropertyForm property={property as any} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText(/Название свойства/i)).toHaveValue('Edit Prop');
        expect(screen.getByTestId('property-value-list')).toBeInTheDocument();
        expect(screen.getByText(/Сохранить изменения/i)).toBeInTheDocument();
    });
});
