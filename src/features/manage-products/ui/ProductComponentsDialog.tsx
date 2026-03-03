/**
 * @file Диалог управления составом изделия (Деталировка / BOM)
 * @description Позволяет добавлять компоненты к номенклатуре, в том числе
 * дочерние номенклатуры (рекурсивный BOM) с формулами размеров и условий
 */

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
    Divider,
    Autocomplete,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Link as LinkIcon,
} from '@mui/icons-material';
import { FormulaEditor } from '../../../shared/ui/FormulaEditor';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
import { useProductComponentSchemas } from '../../../entities/product-component-schema/model/useProductComponentSchemas';
import { useProducts } from '../model/product.hooks';
import type { Product } from '../model/types';

interface ProductComponentsDialogProps {
    /** Открыт ли диалог */
    open: boolean;
    /** Обработчик закрытия */
    onClose: () => void;
    /** ID продукта-родителя */
    productId: number;
    /** Название продукта-родителя */
    productName: string;
    /** Свойства продукта для переменных формулы */
    properties: any[];
}

/**
 * Диалог управления составом изделия (Деталировка)
 */
export const ProductComponentsDialog: React.FC<ProductComponentsDialogProps> = ({
    open,
    onClose,
    productId,
    productName,
    properties
}) => {
    const { schemas, addSchema, removeSchema, isLoading } = useProductComponentSchemas(productId);
    const { products } = useProducts();

    // Состояние формы
    const [name, setName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [lengthFormula, setLengthFormula] = useState('');
    const [widthFormula, setWidthFormula] = useState('');
    const [depthFormula, setDepthFormula] = useState('');
    const [quantityFormula, setQuantityFormula] = useState('1');
    const [conditionFormula, setConditionFormula] = useState('');
    const [extraVars, setExtraVars] = useState<Array<{ key: string; value: string }>>([]);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    /** Переменные для редактора формул */
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

    /** Список номенклатур для выбора (исключаем текущий продукт) */
    const availableProducts = products.filter((p: Product) => p.id !== productId);

    /** Сброс формы */
    const resetForm = () => {
        setName('');
        setSelectedProduct(null);
        setLengthFormula('');
        setWidthFormula('');
        setDepthFormula('');
        setQuantityFormula('1');
        setConditionFormula('');
        setExtraVars([]);
    };

    /** Сохранение компонента */
    const handleSave = async () => {
        if (!name || !lengthFormula || !widthFormula || !quantityFormula) return;

        // Преобразование доп. переменных из массива в объект
        const extraVariablesObj: Record<string, string> = {};
        for (const v of extraVars) {
            if (v.key.trim()) {
                extraVariablesObj[v.key.trim()] = v.value;
            }
        }

        await addSchema({
            productId,
            childProductId: selectedProduct?.id ?? null,
            name,
            lengthFormula,
            widthFormula,
            quantityFormula,
            depthFormula: depthFormula || null,
            extraVariables: Object.keys(extraVariablesObj).length > 0 ? extraVariablesObj : null,
            conditionFormula: conditionFormula || null,
            sortOrder: schemas.length,
        });

        resetForm();
    };

    /** Подготовка к удалению компонента */
    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
    };

    /** Подтверждение удаления компонента */
    const confirmDelete = async () => {
        if (deleteTargetId !== null) {
            await removeSchema(deleteTargetId);
            setDeleteTargetId(null);
        }
    };

    /** Добавление доп. переменной */
    const addExtraVar = () => {
        setExtraVars(prev => [...prev, { key: '', value: '' }]);
    };

    /** Обновление доп. переменной */
    const updateExtraVar = (index: number, field: 'key' | 'value', val: string) => {
        setExtraVars(prev => prev.map((v, i) => i === index ? { ...v, [field]: val } : v));
    };

    /** Удаление доп. переменной */
    const removeExtraVar = (index: number) => {
        setExtraVars(prev => prev.filter((_, i) => i !== index));
    };

    /** При выборе номенклатуры из списка автоматически заполняем название */
    const handleProductSelect = (_: unknown, product: Product | null) => {
        setSelectedProduct(product);
        if (product && !name) {
            setName(product.name);
        }
    };

    /** Проверка валидности формы */
    const isFormValid = name.trim() && lengthFormula.trim() && widthFormula.trim() && quantityFormula.trim();

    /** Поиск названия дочерней номенклатуры по ID */
    const getChildProductName = (childProductId: number | null): string | null => {
        if (!childProductId) return null;
        const product = products.find((p: Product) => p.id === childProductId);
        return product ? product.name : `#${childProductId}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                Деталировка (Состав): {productName}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={4}>
                    {/* Форма добавления */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h6" gutterBottom>
                            Добавить компонент
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Выбор дочерней номенклатуры */}
                            <Autocomplete
                                options={availableProducts}
                                getOptionLabel={(option: Product) => `${option.name} (${option.code})`}
                                value={selectedProduct}
                                onChange={handleProductSelect}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Дочерняя номенклатура (опционально)"
                                        size="small"
                                        placeholder="Выберите номенклатуру или оставьте пустым"
                                        helperText="Если выбрать — компонент станет вложенным изделием со своими операциями"
                                    />
                                )}
                                size="small"
                            />

                            <TextField
                                label="Название компонента"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                size="small"
                                required
                                placeholder="Например: Филенка"
                            />

                            <FormulaEditor
                                value={lengthFormula}
                                onChange={setLengthFormula}
                                variables={variables}
                                label="Формула Высоты (H)"
                                placeholder="H - (W_PR2 + W_PR4) + GP * 2"
                            />

                            <FormulaEditor
                                value={widthFormula}
                                onChange={setWidthFormula}
                                variables={variables}
                                label="Формула Ширины (W)"
                                placeholder="W - (W_PR1 + W_PR3) + GP * 2"
                            />

                            <FormulaEditor
                                value={depthFormula}
                                onChange={setDepthFormula}
                                variables={variables}
                                label="Формула Глубины (D) — опционально"
                                placeholder="D - 4"
                            />

                            <FormulaEditor
                                value={quantityFormula}
                                onChange={setQuantityFormula}
                                variables={variables}
                                label="Формула Количества (Q)"
                                placeholder="1"
                            />

                            {/* Условие включения */}
                            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="body2">Расширенные настройки</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <FormulaEditor
                                            value={conditionFormula}
                                            onChange={setConditionFormula}
                                            variables={variables}
                                            label="Условие включения (опционально)"
                                            placeholder="ПРИКЛЕЙКА_ДЕКОРА == 'true'"
                                            helperText="Компонент будет включён только если условие истинно"
                                        />

                                        {/* Дополнительные переменные */}
                                        <Box>
                                            <Typography variant="body2" gutterBottom>
                                                Дополнительные переменные для дочернего элемента:
                                            </Typography>
                                            {extraVars.map((v, i) => (
                                                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                                    <TextField
                                                        label="Переменная"
                                                        value={v.key}
                                                        onChange={(e) => updateExtraVar(i, 'key', e.target.value)}
                                                        size="small"
                                                        sx={{ flex: 1 }}
                                                        placeholder="GP"
                                                    />
                                                    <Typography>=</Typography>
                                                    <TextField
                                                        label="Формула"
                                                        value={v.value}
                                                        onChange={(e) => updateExtraVar(i, 'value', e.target.value)}
                                                        size="small"
                                                        sx={{ flex: 2 }}
                                                        placeholder="10"
                                                    />
                                                    <IconButton size="small" color="error" onClick={() => removeExtraVar(i)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                            <Button size="small" variant="text" onClick={addExtraVar}>
                                                + Добавить переменную
                                            </Button>
                                        </Box>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>

                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={!isFormValid}
                                sx={{ mt: 1 }}
                            >
                                Добавить в состав
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
                            Состав изделия
                        </Typography>

                        {isLoading ? (
                            <Typography>Загрузка...</Typography>
                        ) : (
                            <List dense sx={{ bgcolor: 'background.paper', maxHeight: 600, overflow: 'auto' }}>
                                {schemas.length === 0 && (
                                    <Typography color="text.secondary" variant="body2">
                                        Состав пуст — добавьте компоненты
                                    </Typography>
                                )}
                                {schemas.map((schema) => (
                                    <ListItem key={schema.id} divider alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {schema.name}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" color="primary">
                                                        ×{schema.quantityFormula}
                                                    </Typography>
                                                    {schema.childProductId && (
                                                        <Chip
                                                            icon={<LinkIcon />}
                                                            label={getChildProductName(schema.childProductId)}
                                                            size="small"
                                                            color="info"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                                    <Typography variant="body2" component="span">
                                                        H: <code>{schema.lengthFormula}</code>
                                                    </Typography>
                                                    <Typography variant="body2" component="span">
                                                        W: <code>{schema.widthFormula}</code>
                                                    </Typography>
                                                    {schema.depthFormula && (
                                                        <Typography variant="body2" component="span">
                                                            D: <code>{schema.depthFormula}</code>
                                                        </Typography>
                                                    )}
                                                    {schema.conditionFormula && (
                                                        <Typography variant="caption" component="span" color="warning.main">
                                                            Условие: <code>{schema.conditionFormula}</code>
                                                        </Typography>
                                                    )}
                                                    {schema.extraVariables && Object.keys(schema.extraVariables).length > 0 && (
                                                        <Box component="span" sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                            {Object.entries(schema.extraVariables).map(([k, v]) => (
                                                                <Chip key={k} label={`${k}=${v}`} size="small" variant="outlined" />
                                                            ))}
                                                        </Box>
                                                    )}
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
            <ConfirmDialog
                open={deleteTargetId !== null}
                title="Удаление компонента"
                content="Удалить этот компонент из состава? Это может повлиять на расчет спецификации."
                onClose={() => setDeleteTargetId(null)}
                onConfirm={confirmDelete}
            />
        </Dialog>
    );
};
