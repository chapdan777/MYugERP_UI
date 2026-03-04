import { useState, useEffect, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CreateOrderItemDto, OrderPropertyDto } from '@shared/api/order/types';
import { propertyHeadersApi } from '@shared/api/property-headers';
import type { HeaderProduct } from '@shared/api/property-headers/types';
import { pricingApi } from '@shared/api/pricing';
import { debounce } from 'lodash';
import { ItemDetailsModal } from './ItemDetailsModal';
import { PropertyConflictDialog } from './PropertyConflictDialog';

interface OrderItemsTableProps {
    headerId: number;
    items: CreateOrderItemDto[];
    onChange: (items: CreateOrderItemDto[]) => void;
    sectionProperties?: OrderPropertyDto[];
}

import type { PriceCalculationResult } from '@shared/api/pricing/types';

// ... (existing imports)

import { useAuth } from '@shared/lib/hooks/useAuth';

// ... (existing imports)

export const OrderItemsTable = ({ headerId, items, onChange, sectionProperties }: OrderItemsTableProps) => {
    const { isManager } = useAuth();
    const [products, setProducts] = useState<HeaderProduct[]>([]);
    const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
    const [pendingItemUpdate, setPendingItemUpdate] = useState<{ item: CreateOrderItemDto, note: string } | null>(null);
    const [calculationResults, setCalculationResults] = useState<Record<number, PriceCalculationResult>>({});

    // --- Responsive Layout Logic ---
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (headerId) {
            propertyHeadersApi.getProducts(headerId)
                .then(data => setProducts(data))
                .catch(err => console.error('Error fetching products:', err));
        }
    }, [headerId]);

    // Keep track of latest items for async operations
    const itemsRef = useRef(items);
    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const handleAddRow = () => {
        const defaultProduct = products.length > 0 ? products[0] : null;
        const defaultProductId = defaultProduct ? defaultProduct.id : 0;
        const newItem: CreateOrderItemDto = {
            productId: defaultProductId,
            quantity: 1,
            unit: 'шт',
            length: defaultProduct?.defaultLength ?? 0,
            width: defaultProduct?.defaultWidth ?? 0,
            depth: defaultProduct?.defaultDepth ?? 0,
            properties: [] // Initially empty, will inherit from section if needed
        };
        onChange([...items, newItem]);
    };

    const handleRemoveRow = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const debouncedCalculatePrice = useMemo(
        () => debounce(async (index: number, item: CreateOrderItemDto, sectionProps?: OrderPropertyDto[]) => {
            if (!item.productId) return;

            try {
                // Слияние свойств: свойства позиции > свойства секции
                // Свойства позиции идут ПЕРВЫМИ, чтобы иметь приоритет (reduce сохраняет первое вхождение)
                const mergedProperties = [
                    ...(item.properties || []),
                    ...(sectionProps || [])
                ].reduce((acc, curr) => {
                    // Добавляем только если свойство ещё не существует
                    if (!acc.find(p => p.propertyId === curr.propertyId)) {
                        acc.push(curr);
                    }
                    return acc;
                }, [] as OrderPropertyDto[]);

                const apiPropertyValues = mergedProperties.map(p => ({
                    propertyId: p.propertyId,
                    propertyValue: p.value
                }));

                const result = await pricingApi.calculatePrice({
                    basePrice: 0,
                    productId: Number(item.productId),
                    quantity: Number(item.quantity), // Allow 0
                    length: Number(item.length) || 0,
                    width: Number(item.width) || 0,
                    depth: Number(item.depth) || 0,
                    propertyValues: apiPropertyValues,
                });

                // Обновление цен - сохраняем properties из переданного item, чтобы не перезаписывать редактирования пользователя
                const currentItems = [...itemsRef.current];
                if (currentItems[index]) {
                    const updatedItem = {
                        ...currentItems[index],
                        // Сохраняем properties из параметра item (который содержит актуальные изменения пользователя)
                        // чтобы избежать race condition с устаревшими данными itemsRef
                        properties: item.properties,
                        basePrice: result.basePrice,
                        finalPrice: result.finalPrice,
                        // Update unit if mapped
                        unit: result.unitType === 'linear_meter' ? 'п.м.' : result.unitType === 'm2' ? 'м2' : 'шт'
                    };
                    currentItems[index] = updatedItem;
                    onChange(currentItems);

                    // Save calculation result for debug view
                    setCalculationResults(prev => ({
                        ...prev,
                        [index]: result
                    }));
                }
            } catch (error) {
                console.error('Price calculation failed:', error);

                // Using Type Assertion for error to safely access response
                const axiosError = error as { response?: { data?: unknown } };
                if (axiosError.response?.data) {
                    console.error('SERVER VALIDATION ERRORS:', JSON.stringify(axiosError.response.data, null, 2));
                }
            }
        }, 800),
        [onChange]
    );

    const handleUpdateRow = (index: number, field: keyof CreateOrderItemDto, value: string | number) => {
        const newItems = [...items];
        let updatedItem = { ...newItems[index], [field]: value };

        // Apply default dimensions if a new product is selected
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                if (product.defaultLength != null) {
                    updatedItem.length = product.defaultLength;
                }
                if (product.defaultWidth != null) {
                    updatedItem.width = product.defaultWidth;
                }
                if (product.defaultDepth != null) {
                    updatedItem.depth = product.defaultDepth;
                }
            }
        }

        newItems[index] = updatedItem;
        onChange(newItems);

        // Trigger price calculation if relevant fields changed
        if (['productId', 'length', 'width', 'depth', 'quantity'].includes(field as string)) {
            debouncedCalculatePrice(index, updatedItem, sectionProperties);
        }
    };

    // --- Detail Modal Logic ---

    const handleOpenDetails = (index: number) => {
        setEditItemIndex(index);
    };

    const handleCloseDetails = () => {
        setEditItemIndex(null);
        setConflictDialogOpen(false);
        setPendingItemUpdate(null);
    };

    const currentEditItem = editItemIndex !== null ? items[editItemIndex] : null;

    // Logic to pre-fill properties when opening modal
    const getItemProperties = () => {
        if (!currentEditItem) return [];
        // If item has properties, use them. 
        // If not (length 0), use section properties as default "starting point" for editing
        if (!currentEditItem.properties || currentEditItem.properties.length === 0) {
            return [...(sectionProperties || [])];
        }
        return currentEditItem.properties;
    };

    const itemForModal = currentEditItem ? {
        ...currentEditItem,
        properties: getItemProperties()
    } : null;

    const currentProductName = currentEditItem
        ? products.find(p => p.id === currentEditItem.productId)?.name
        : '';

    // --- Save & Conflict Logic ---

    const saveItem = (item: CreateOrderItemDto) => {
        if (editItemIndex !== null) {
            const newItems = [...items];
            newItems[editItemIndex] = item;
            onChange(newItems);
            // Запустить пересчёт цены после сохранения
            debouncedCalculatePrice(editItemIndex, item, sectionProperties);
            // Не закрывать модалку автоматически, чтобы редактирование продолжалось
            // handleCloseDetails();
        }
    };

    const handleSaveDetails = (updatedItem: CreateOrderItemDto) => {
        // Обнаружение конфликтов
        const conflicts: string[] = [];
        const sectionProps = sectionProperties || [];

        updatedItem.properties?.forEach(itemProp => {
            const sectionProp = sectionProps.find(sp => sp.propertyId === itemProp.propertyId);
            if (sectionProp && sectionProp.value !== itemProp.value) {
                conflicts.push(`${itemProp.propertyName}: ${itemProp.value} (Секция: ${sectionProp.value})`);
            }
        });

        if (conflicts.length > 0) {
            // Conflict found
            // const conflictMsg = `Следующие свойства отличаются от значений секции: ${conflicts.join(', ')}.`;
            const noteToAdd = conflicts.map(c => c.split(' (')[0]).join(', '); // Simplified note

            setPendingItemUpdate({ item: updatedItem, note: noteToAdd });
            setConflictDialogOpen(true);
        } else {
            // No conflict, save directly
            saveItem(updatedItem);
        }
    };

    const handleResolveConflictAddNote = () => {
        if (pendingItemUpdate) {
            const { item, note } = pendingItemUpdate;
            // Append to existing note or create new
            const newNote = item.note ? `${item.note}. ${note}` : note;
            saveItem({ ...item, note: newNote });
            // Close conflict dialog and clear pending update
            setConflictDialogOpen(false);
            setPendingItemUpdate(null);
        }
    };

    const handleResolveConflictMove = () => {
        alert('Функция переноса в разработке');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Позиции секции</Box>
                <Button startIcon={<AddIcon />} size="small" onClick={handleAddRow}>
                    Добавить позицию
                </Button>
            </Box>

            {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.map((item, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary">Позиция #{idx + 1}</Typography>
                                <IconButton size="small" color="error" onClick={() => handleRemoveRow(idx)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <TextField
                                select
                                fullWidth
                                label="Номенклатура"
                                size="small"
                                value={item.productId}
                                onChange={(e) => handleUpdateRow(idx, 'productId', Number(e.target.value))}
                            >
                                <MenuItem value={0} disabled>Выберите товар</MenuItem>
                                {products.filter(p => p.name && !p.name.includes('#')).map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </TextField>

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                                <TextField
                                    label="Длина"
                                    size="small"
                                    type="number"
                                    fullWidth
                                    value={item.length || ''}
                                    onChange={(e) => handleUpdateRow(idx, 'length', Number(e.target.value))}
                                />
                                <TextField
                                    label="Ширина"
                                    size="small"
                                    type="number"
                                    fullWidth
                                    value={item.width || ''}
                                    onChange={(e) => handleUpdateRow(idx, 'width', Number(e.target.value))}
                                />
                                <TextField
                                    label="Кол-во"
                                    size="small"
                                    type="number"
                                    fullWidth
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateRow(idx, 'quantity', Number(e.target.value))}
                                    InputProps={{
                                        endAdornment: <Typography variant="caption" sx={{ ml: 0.5 }}>{item.unit}</Typography>
                                    }}
                                />
                            </Box>

                            <TextField
                                label="Примечание"
                                size="small"
                                fullWidth
                                value={item.note || ''}
                                onChange={(e) => handleUpdateRow(idx, 'note', e.target.value)}
                            />

                            {isManager && (
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                    <TextField
                                        label="Цена (баз)"
                                        size="small"
                                        type="number"
                                        fullWidth
                                        value={item.basePrice || ''}
                                        onChange={(e) => handleUpdateRow(idx, 'basePrice', Number(e.target.value))}
                                    />
                                    <TextField
                                        label="Цена (итог)"
                                        size="small"
                                        type="number"
                                        fullWidth
                                        value={item.finalPrice || ''}
                                        onChange={(e) => handleUpdateRow(idx, 'finalPrice', Number(e.target.value))}
                                    />
                                </Box>
                            )}

                            <Button variant="outlined" size="small" fullWidth onClick={() => handleOpenDetails(idx)}>
                                Дополнительно / Свойства
                            </Button>
                        </Paper>
                    ))}
                    {items.length === 0 && (
                        <Typography variant="body2" align="center" sx={{ color: 'text.secondary', py: 3 }}>
                            Нет позиций
                        </Typography>
                    )}
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                <TableCell sx={{ width: 40, p: 0.5 }}></TableCell>
                                <TableCell sx={{ minWidth: 200, p: 0.5 }}>Номенклатура</TableCell>
                                <TableCell sx={{ minWidth: 80, p: 0.5 }}>Длина</TableCell>
                                <TableCell sx={{ minWidth: 80, p: 0.5 }}>Ширина</TableCell>
                                <TableCell sx={{ minWidth: 80, p: 0.5 }}>Толщина</TableCell>
                                <TableCell sx={{ minWidth: 80, p: 0.5 }}>Кол-во</TableCell>
                                <TableCell sx={{ minWidth: 60, p: 0.5 }}>Ед.</TableCell>
                                <TableCell sx={{ minWidth: 150, p: 0.5 }}>Примечание</TableCell>
                                {isManager && (
                                    <>
                                        <TableCell sx={{ minWidth: 100, p: 0.5 }}>Цена (баз)</TableCell>
                                        <TableCell sx={{ minWidth: 100, p: 0.5 }}>Цена (итог)</TableCell>
                                    </>
                                )}
                                <TableCell width={50} sx={{ p: 0.5 }}></TableCell>
                                <TableCell width={50} sx={{ p: 0.5 }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell align="center" sx={{ p: 0.5, color: 'text.secondary', width: 40 }}>
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell sx={{ p: 0.5 }}>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={item.productId}
                                            onChange={(e) => handleUpdateRow(idx, 'productId', Number(e.target.value))}
                                            sx={{
                                                '& .MuiOutlinedInput-input': {
                                                    color: 'text.primary',
                                                    WebkitTextFillColor: 'unset !important'
                                                }
                                            }}
                                        >
                                            <MenuItem value={0} disabled>Выберите товар</MenuItem>
                                            {products.filter(p => p.name && !p.name.includes('#')).map(p => (
                                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </TableCell>
                                    <TableCell sx={{ p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={item.length || ''}
                                            onChange={(e) => handleUpdateRow(idx, 'length', Number(e.target.value))}
                                            placeholder="0"
                                            inputProps={{ sx: { px: 1, py: 0.75, textAlign: 'center' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={item.width || ''}
                                            onChange={(e) => handleUpdateRow(idx, 'width', Number(e.target.value))}
                                            placeholder="0"
                                            inputProps={{ sx: { px: 1, py: 0.75, textAlign: 'center' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={item.depth || ''}
                                            onChange={(e) => handleUpdateRow(idx, 'depth', Number(e.target.value))}
                                            placeholder="0"
                                            inputProps={{ sx: { px: 1, py: 0.75, textAlign: 'center' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={item.quantity}
                                            onChange={(e) => handleUpdateRow(idx, 'quantity', Number(e.target.value))}
                                            inputProps={{ sx: { px: 1, py: 0.75, textAlign: 'center' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ p: 0.5 }}>{item.unit}</TableCell>
                                    <TableCell sx={{ p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={item.note || ''}
                                            onChange={(e) => handleUpdateRow(idx, 'note', e.target.value)}
                                            placeholder="..."
                                        />
                                    </TableCell>
                                    {isManager && (
                                        <>
                                            <TableCell sx={{ p: 0.5 }}>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={item.basePrice || ''}
                                                    onChange={(e) => handleUpdateRow(idx, 'basePrice', Number(e.target.value))}
                                                    placeholder="0.00"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ p: 0.5 }}>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={item.finalPrice || ''}
                                                    onChange={(e) => handleUpdateRow(idx, 'finalPrice', Number(e.target.value))}
                                                    placeholder="0.00"
                                                />
                                            </TableCell>
                                        </>
                                    )}
                                    <TableCell sx={{ p: 0.5 }}>
                                        <Button size="small" variant="outlined" sx={{ minWidth: 'auto', p: 0.5 }} onClick={() => handleOpenDetails(idx)}>
                                            Инфо
                                        </Button>
                                    </TableCell>
                                    <TableCell sx={{ p: 0.5 }}>
                                        <IconButton size="small" onClick={() => handleRemoveRow(idx)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isManager ? 10 : 8} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                                        Нет позиций
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <ItemDetailsModal
                key={editItemIndex}
                open={editItemIndex !== null}
                onClose={handleCloseDetails}
                item={itemForModal}
                headerId={headerId}
                onSave={handleSaveDetails}
                itemName={currentProductName}
                calculationResult={editItemIndex !== null ? calculationResults[editItemIndex] : undefined}
                sectionProperties={sectionProperties}
            />

            <PropertyConflictDialog
                open={conflictDialogOpen}
                onClose={() => {
                    setConflictDialogOpen(false);
                    setPendingItemUpdate(null);
                }}
                onAddNote={handleResolveConflictAddNote}
                onMoveSection={handleResolveConflictMove}
                conflictMessage={pendingItemUpdate ? `Свойства: ${pendingItemUpdate.note}` : ''}
            />
        </Box>
    );
};
