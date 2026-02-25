import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { GlassCard } from '@shared/ui';
import { DynamicPropertyForm } from './DynamicPropertyForm';
import { OrderItemsTable } from './OrderItemsTable';
import type { CreateOrderSectionDto, OrderPropertyDto, CreateOrderItemDto } from '@shared/api/order/types';

interface OrderSectionProps {
    section: CreateOrderSectionDto;
    index: number;
    onRemove: (index: number) => void;
    onUpdate: (index: number, data: Partial<CreateOrderSectionDto>) => void;
}

export const OrderSection = ({ section, index, onRemove, onUpdate }: OrderSectionProps) => {
    const handlePropertiesChange = (properties: OrderPropertyDto[]) => {
        onUpdate(index, { propertyValues: properties });
    };

    const handleItemsChange = (items: CreateOrderItemDto[]) => {
        onUpdate(index, { items });
    };

    return (
        <GlassCard sx={{ mb: 3, position: 'relative', overflow: 'visible' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Секция {section.sectionNumber}: {section.sectionName}
                </Typography>
                <IconButton onClick={() => onRemove(index)} color="error" size="small">
                    <DeleteIcon />
                </IconButton>
            </Box>

            {/* Dynamic Properties Form */}
            <Box sx={{ mb: 3 }}>
                <DynamicPropertyForm
                    headerId={section.headerId!} // Assuming headerId is passed
                    values={section.propertyValues || []}
                    onChange={handlePropertiesChange}
                />
            </Box>

            {/* Items Table */}
            <Box sx={{ mt: 3, width: '100%', overflowX: 'auto' }}>
                <OrderItemsTable
                    headerId={section.headerId!}
                    items={section.items || []}
                    onChange={handleItemsChange}
                    sectionProperties={section.propertyValues || []}
                />
            </Box>
        </GlassCard>
    );
};
