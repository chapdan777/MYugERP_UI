import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { FormulaEditor } from '../../../shared/ui/FormulaEditor';

import { useRawMaterials } from '../model/product.hooks';
import { useTechnologicalRoute } from '../model/technological-route.hooks';

interface ProductMaterialsDialogProps {
    open: boolean;
    onClose: () => void;
    productId: number;
    productName: string;
    properties: any[]; // Properties from parent
}

export const ProductMaterialsDialog: React.FC<ProductMaterialsDialogProps> = ({
    open,
    onClose,
    productId,
    productName,
    properties
}) => {
    const { materials: rawMaterials, isLoading: isLoadingMaterials } = useRawMaterials();
    const { technologicalRoute, isLoading: isLoadingRoute, saveRoute } = useTechnologicalRoute(productId);

    const [materials, setMaterials] = useState<any[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<string>('');
    const [formula, setFormula] = useState<string>('');
    const [isEditingId, setIsEditingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load existing route data when dialog opens
    useEffect(() => {
        if (open && technologicalRoute) {
            // Flatten materials from all steps (assuming simple use case for now)
            // Or just take the first step if we want to enforce single-step via this UI
            const allMaterials: any[] = [];
            technologicalRoute.steps.forEach(step => {
                step.materials.forEach(mat => {
                    const productInfo = rawMaterials.find((p: any) => p.id === mat.materialId);
                    allMaterials.push({
                        id: Date.now() + Math.random(), // Temp UI ID
                        materialId: mat.materialId.toString(),
                        formula: mat.consumptionFormula,
                        unit: mat.unit || productInfo?.unit || 'шт',
                        materialName: productInfo?.name || `Material #${mat.materialId}`
                    });
                });
            });
            setMaterials(allMaterials);
        } else if (open && !technologicalRoute && !isLoadingRoute) {
            setMaterials([]);
        }
    }, [open, technologicalRoute, rawMaterials, isLoadingRoute]);

    // Prepare variables for Formula Editor
    const variables = [
        { name: 'H', description: 'Высота изделия', value: 2000 },
        { name: 'W', description: 'Ширина изделия', value: 1000 },
        { name: 'D', description: 'Глубина изделия', value: 100 },
        ...properties.map(p => ({
            name: p.property.variableName || `PROP_${p.propertyId}`,
            description: p.property.name,
            value: p.value || 0
        }))
    ];

    const handleAddOrUpdate = () => {
        if (!selectedMaterial || !formula) return;

        const materialInfo = rawMaterials.find((p: any) => p.id.toString() === selectedMaterial);

        if (isEditingId) {
            setMaterials(prev => prev.map(m =>
                m.id === isEditingId
                    ? { ...m, materialId: selectedMaterial, formula, materialName: materialInfo?.name, unit: materialInfo?.unit }
                    : m
            ));
            setIsEditingId(null);
        } else {
            setMaterials(prev => [
                ...prev,
                {
                    id: Date.now(),
                    materialId: selectedMaterial,
                    formula,
                    materialName: materialInfo?.name,
                    unit: materialInfo?.unit
                }
            ]);
        }

        // Reset form
        setSelectedMaterial('');
        setFormula('');
    };

    const handleEdit = (item: any) => {
        setIsEditingId(item.id);
        setSelectedMaterial(item.materialId);
        setFormula(item.formula);
    };

    const handleDelete = (id: number) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    const handleSaveToServer = async () => {
        setIsSaving(true);
        try {
            // Create a single step with all materials
            await saveRoute({
                productId,
                name: 'Основной маршрут', // Default name
                description: 'Автоматически создан через редактор материалов',
                steps: [
                    {
                        stepNumber: 1,
                        operationId: 0, // Material-only route, no specific operation
                        isRequired: true,
                        materials: materials.map(m => ({
                            materialId: parseInt(m.materialId),
                            consumptionFormula: m.formula,
                            unit: m.unit
                        }))
                    }
                ]
            });
            onClose();
        } catch (e) {
            console.error('Failed to save route', e);
            alert('Ошибка при сохранении маршрута');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Материалы для: {productName}
            </DialogTitle>
            <DialogContent>
                {isLoadingRoute ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ mb: 3, mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Добавить материал и формулу расхода
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Материал</InputLabel>
                                <Select
                                    value={selectedMaterial}
                                    label="Материал"
                                    onChange={(e) => setSelectedMaterial(e.target.value)}
                                    disabled={isLoadingMaterials}
                                >
                                    {isLoadingMaterials ? (
                                        <MenuItem value="">Загрузка...</MenuItem>
                                    ) : (
                                        rawMaterials.map((p: any) => (
                                            <MenuItem key={p.id} value={p.id.toString()}>
                                                {p.name} ({p.unit})
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Box>

                        <FormulaEditor
                            value={formula}
                            onChange={setFormula}
                            variables={variables}
                            label="Формула расчета количества"
                            placeholder="Например: (H * W) / 1000000"
                            helperText="Используйте переменные H, W, D и свойства продукта"
                        />

                        <Button
                            variant="contained"
                            onClick={handleAddOrUpdate}
                            disabled={!selectedMaterial || !formula}
                            sx={{ mt: 1 }}
                        >
                            {isEditingId ? 'Обновить список' : 'Добавить в список'}
                        </Button>
                    </Box>
                )}

                <Typography variant="h6" gutterBottom>
                    Список материалов (нужно сохранить)
                </Typography>
                <List dense>
                    {materials.length === 0 && (
                        <Typography color="text.secondary" variant="body2">
                            Нет добавленных материалов
                        </Typography>
                    )}
                    {materials.map(item => (
                        <ListItem key={item.id} divider>
                            <ListItemText
                                primary={item.materialName}
                                secondary={`Расход: ${item.formula} (${item.unit})`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton size="small" onClick={() => handleEdit(item)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSaving}>Отмена</Button>
                <Button onClick={handleSaveToServer} disabled={isSaving} variant="contained" color="primary">
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
