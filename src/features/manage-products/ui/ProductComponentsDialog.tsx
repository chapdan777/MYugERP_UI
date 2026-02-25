import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Grid,
    Divider
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { FormulaEditor } from '../../../shared/ui/FormulaEditor';
import { useProductComponentSchemas } from '../../../entities/product-component-schema/model/useProductComponentSchemas';

interface ProductComponentsDialogProps {
    open: boolean;
    onClose: () => void;
    productId: number;
    productName: string;
    properties: any[]; // Свойства продукта для переменных формулы
}

export const ProductComponentsDialog: React.FC<ProductComponentsDialogProps> = ({
    open,
    onClose,
    productId,
    productName,
    properties
}) => {
    const { schemas, addSchema, removeSchema, isLoading } = useProductComponentSchemas(productId);

    const [name, setName] = useState('');
    const [lengthFormula, setLengthFormula] = useState('');
    const [widthFormula, setWidthFormula] = useState('');
    const [quantityFormula, setQuantityFormula] = useState('1');

    // Переменные для редактора формул
    const variables = [
        { name: 'H', description: 'Высота изделия', value: 2000 },
        { name: 'W', description: 'Ширина изделия', value: 1000 },
        { name: 'D', description: 'Глубина изделия', value: 600 },
        ...properties.map(p => ({
            name: p.property.variableName || `PROP_${p.propertyId}`,
            description: p.property.name,
            value: p.value || 0
        }))
    ];

    const handleSave = async () => {
        if (!name || !lengthFormula || !widthFormula || !quantityFormula) return;

        await addSchema({
            productId,
            name,
            lengthFormula,
            widthFormula,
            quantityFormula
        });

        // Сброс формы
        setName('');
        setLengthFormula('');
        setWidthFormula('');
        setQuantityFormula('1');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот компонент?')) {
            await removeSchema(id);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                Компоненты (Деталировка) для: {productName}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={4}>
                    {/* Форма добавления */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h6" gutterBottom>
                            Добавить компонент
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Название детали"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="Например: Боковина"
                            />

                            <FormulaEditor
                                value={lengthFormula}
                                onChange={setLengthFormula}
                                variables={variables}
                                label="Формула Длины (L)"
                                placeholder="Например: H - 32"
                            />

                            <FormulaEditor
                                value={widthFormula}
                                onChange={setWidthFormula}
                                variables={variables}
                                label="Формула Ширины (W)"
                                placeholder="Например: D - 4"
                            />

                            <FormulaEditor
                                value={quantityFormula}
                                onChange={setQuantityFormula}
                                variables={variables}
                                label="Формула Количества (Q)"
                                placeholder="Например: 2"
                            />

                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={!name || !lengthFormula || !widthFormula || !quantityFormula}
                                sx={{ mt: 1 }}
                            >
                                Добавить
                            </Button>
                        </Box>
                    </Grid>

                    {/* Разделитель на мобильных */}
                    <Grid size={{ xs: 12 }} sx={{ display: { md: 'none' } }}>
                        <Divider />
                    </Grid>

                    {/* Список компонентов */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h6" gutterBottom>
                            Список деталей
                        </Typography>

                        {isLoading ? (
                            <Typography>Загрузка...</Typography>
                        ) : (
                            <List dense sx={{ bgcolor: 'background.paper', maxHeight: 600, overflow: 'auto' }}>
                                {schemas.length === 0 && (
                                    <Typography color="text.secondary" variant="body2">
                                        Нет добавленных деталей
                                    </Typography>
                                )}
                                {schemas.map(schema => (
                                    <ListItem key={schema.id} divider alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {schema.name} <Typography component="span" variant="body2" color="primary">x {schema.quantityFormula}</Typography>
                                                </Typography>
                                            }
                                            secondary={
                                                <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                                    <Typography variant="body2" component="span">
                                                        L: <code>{schema.lengthFormula}</code>
                                                    </Typography>
                                                    <Typography variant="body2" component="span">
                                                        W: <code>{schema.widthFormula}</code>
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" size="small" color="error" onClick={() => handleDelete(schema.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
};
