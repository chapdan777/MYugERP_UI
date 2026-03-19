import { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DynamicPropertyForm } from './DynamicPropertyForm';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useGetProductProperties } from '../../manage-products/model/product.hooks';
import { propertyApi } from '@shared/api/property';
import type { Property } from '@shared/api/property/types';
import type { CreateOrderItemDto, OrderPropertyDto } from '@shared/api/order/types';
import type { PriceCalculationResult } from '@shared/api/pricing/types';
import { pricingApi } from '@shared/api/pricing';
import { useProductComponentSchemas } from '../../../entities/product-component-schema/model/useProductComponentSchemas';
import { useNestedProductProperties } from '../../../entities/product-component-schema/model/useNestedProductProperties';
import { NestedPropertyTabs } from './NestedPropertyTabs';
import type { NestedProductNode } from '../../../entities/product-component-schema/model/types';

interface ItemDetailsModalProps {
    open: boolean;
    onClose: () => void;
    item: CreateOrderItemDto | null;
    headerId: number;
    onSave: (updatedItem: CreateOrderItemDto) => void;
    itemName?: string;
    calculationResult?: PriceCalculationResult;
    sectionProperties?: OrderPropertyDto[];
}

export const ItemDetailsModal = ({ open, onClose, item, headerId, onSave, itemName, calculationResult, sectionProperties }: ItemDetailsModalProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Локальное состояние для редактирования, чтобы UI обновлялся мгновенно
    const [localItem, setLocalItem] = useState<CreateOrderItemDto | null>(item);

    const [localCalcResult, setLocalCalcResult] = useState<PriceCalculationResult | undefined>(calculationResult);
    const [isCalculating, setIsCalculating] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Обновить локальный результат, когда приходит новый извне
    useEffect(() => {
        setLocalCalcResult(calculationResult);
    }, [calculationResult]);

    const { getProductProperties } = useGetProductProperties();
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [productProps, setProductProps] = useState<any[]>([]);
    const [selectedPropToAdd, setSelectedPropToAdd] = useState<string>('');
    useProductComponentSchemas(Number(localItem?.productId));
    const { nestedProperties, isLoading: nestedLoading } = useNestedProductProperties(
        localItem?.productId ? Number(localItem.productId) : null
    );

    // Локальное состояние для вложенных свойств (ключ — productId дочерней номенклатуры)
    const [nestedValues, setNestedValues] = useState<Record<number, OrderPropertyDto[]>>({});
    // Флаг, что первичная инициализация из localItem завершена (предотвращает гонки при открытии)
    const [isInitialized, setIsInitialized] = useState(false);

    // Сбрасываем флаг инициализации при открытии
    useEffect(() => {
        if (open) setIsInitialized(false);
    }, [open]);

    // Вспомогательная функция для слияния свойств родителя и секции (создает "полный контекст")
    const getCombinedParentProps = useCallback(() => {
        return [...(localItem?.properties || []), ...(sectionProperties || [])].reduce((acc, curr) => {
            if (!acc.find(p => p.propertyId === curr.propertyId)) {
                // Обогащаем свойство полем variableName для поддержки вычисления формул
                const propGlobal = allProperties?.find(gp => gp.id === curr.propertyId);
                const enriched = { ...curr };
                if (propGlobal?.variableName) {
                    enriched.variableName = propGlobal.variableName;
                }
                acc.push(enriched);
            }
            return acc;
        }, [] as OrderPropertyDto[]);
    }, [localItem?.properties, sectionProperties, allProperties]);

    /** 
     * Рекурсивное применение наследования свойств (INHERITS)
     */
    const applyDeepInheritance = (
        nodes: NestedProductNode[],
        parentProps: OrderPropertyDto[],
        currentNestedValues: Record<number, OrderPropertyDto[]>
    ): { updatedValues: Record<number, OrderPropertyDto[]>, hasChanges: boolean } => {
        let hasChanges = false;
        const newValues = { ...currentNestedValues };

        const parentCodeMap = new Map<string, string>();
        parentProps.forEach(p => {
            if (p.propertyCode) {
                parentCodeMap.set(p.propertyCode, p.value);
            }
        });

        nodes.forEach(node => {
            const childId = node.productId;
            let childProps = [...(newValues[childId] || [])];
            let childChanged = false;

            // ГАРАНТИЯ: Инициализируем свойства из метаданных или восстанавливаем коды
            node.properties.forEach(propDef => {
                const existingIdx = childProps.findIndex(p => p.propertyId === propDef.propertyId);
                if (existingIdx === -1) {
                    console.log(`[Inheritance] Initializing property ${propDef.propertyName} for ${node.productName}`);
                    const propGlobal = allProperties?.find(gp => gp.id === propDef.propertyId);
                    childProps.push({
                        propertyId: propDef.propertyId,
                        propertyName: propDef.propertyName,
                        propertyCode: propDef.propertyCode || '',
                        value: propDef.defaultValue || '',
                        variableName: propGlobal?.variableName || undefined
                    });
                    childChanged = true;
                    hasChanges = true;
                } else {
                    // Восстанавливаем код свойства, если он потерялся (для старых данных)
                    const propGlobal = allProperties?.find(gp => gp.id === childProps[existingIdx].propertyId);

                    if (!childProps[existingIdx].propertyCode && propDef.propertyCode) {
                        childProps[existingIdx] = {
                            ...childProps[existingIdx],
                            propertyCode: propDef.propertyCode,
                            variableName: propGlobal?.variableName || undefined
                        };
                        childChanged = true;
                        hasChanges = true;
                    } else if (propGlobal?.variableName && !childProps[existingIdx].variableName) {
                        // Добавляем variableName, если его нет
                        childProps[existingIdx] = {
                            ...childProps[existingIdx],
                            variableName: propGlobal.variableName
                        };
                        childChanged = true;
                        hasChanges = true;
                    }
                }
            });

            // Наследуем свойства от родителя к текущему узлу по коду
            // ВАЖНО: не наследуем пустые значения от родителя, т.к. они могут перезаписать
            // значения, установленные через зависимости (sets_value) или вручную
            for (let i = 0; i < childProps.length; i++) {
                const childProp = childProps[i];
                if (childProp.propertyCode) {
                    const parentValue = parentCodeMap.get(childProp.propertyCode);
                    if (parentValue !== undefined && parentValue !== '' && childProp.value !== parentValue) {
                        console.log(`[Inheritance] ${node.productName}: Inheriting ${childProp.propertyCode} = ${parentValue}`);
                        childProps[i] = { ...childProp, value: parentValue };
                        childChanged = true;
                        hasChanges = true;
                    }
                }
            }

            if (childChanged) {
                newValues[childId] = childProps;
            }

            if (node.children.length > 0) {
                const result = applyDeepInheritance(node.children, childProps, newValues);
                if (result.hasChanges) {
                    Object.assign(newValues, result.updatedValues);
                    hasChanges = true;
                }
            }
        });

        return { updatedValues: newValues, hasChanges };
    };

    // ЕДИНЫЙ эффект для инициализации и авто-наследования
    useEffect(() => {
        if (!open || nestedLoading || nestedProperties.length === 0) return;

        // База: если еще не инициализированы - берем из localItem, иначе из текущего состояния
        const baseValues = !isInitialized && localItem?.nestedProperties
            ? localItem.nestedProperties
            : nestedValues;

        const { updatedValues, hasChanges } = applyDeepInheritance(
            nestedProperties,
            getCombinedParentProps(),
            baseValues
        );

        // Обновляем состояние, если это первая инициализация ИЛИ произошли изменения в наследовании
        if (!isInitialized || hasChanges) {
            console.log("[Inheritance] Syncing nested properties. Changes detected:", hasChanges);
            setNestedValues(updatedValues);
            setIsInitialized(true);

            if (hasChanges && localItem) {
                const updatedItem = { ...localItem, nestedProperties: updatedValues };
                setLocalItem(updatedItem);
                onSave(updatedItem);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, nestedLoading, nestedProperties, localItem?.properties, sectionProperties, isInitialized]);

    /** Обработчик изменения свойств вложенного компонента */
    const handleNestedPropertiesChange = (productId: number, values: OrderPropertyDto[]) => {
        const baseNestedValues = {
            ...nestedValues,
            [productId]: values,
        };

        const { updatedValues } = applyDeepInheritance(
            nestedProperties,
            getCombinedParentProps(),
            baseNestedValues
        );

        setNestedValues(updatedValues);
        if (localItem) {
            const updatedItem = { ...localItem, nestedProperties: updatedValues };
            setLocalItem(updatedItem);
            onSave(updatedItem);
        }
    };

    // Fetch product and global properties on open
    useEffect(() => {
        if (open && localItem?.productId) {
            Promise.all([
                getProductProperties(Number(localItem.productId)),
                propertyApi.getProperties()
            ]).then(([pProps, aProps]) => {
                setProductProps(pProps);
                setAllProperties(aProps);
            }).catch(err => console.error("Failed to load properties for modal:", err));
        }
    }, [open, localItem?.productId]);

    // Вычисляем доступные для добавления свойства
    const availablePropertiesToAdd = productProps.filter((pp: any) => {
        const isAlreadyAdded = localItem?.properties?.some((p: any) => p.propertyId === pp.propertyId);
        if (isAlreadyAdded) return false;
        const propGlobal = allProperties.find(gp => gp.id === pp.propertyId);
        if (!propGlobal) return false;
        return true;
    }).map((pp: any) => {
        const propGlobal = allProperties.find(gp => gp.id === pp.propertyId);
        return {
            propertyId: pp.propertyId,
            name: propGlobal?.name || `Property ${pp.propertyId}`,
            code: propGlobal?.code || '',
            defaultValue: pp.defaultValue || propGlobal?.defaultValue || ''
        };
    });

    const handleAddProperty = () => {
        if (!selectedPropToAdd || !localItem) return;

        const propId = Number(selectedPropToAdd);
        const propToAdd = availablePropertiesToAdd.find(p => p.propertyId === propId);
        if (!propToAdd) return;

        const newProp: OrderPropertyDto = {
            propertyId: propToAdd.propertyId,
            propertyName: propToAdd.name,
            propertyCode: propToAdd.code,
            value: propToAdd.defaultValue || ''
        };

        const newProperties = [...(localItem.properties || []), newProp];
        handlePropertiesChange(newProperties);
        setSelectedPropToAdd('');
    };

    const handleRecalculate = useCallback(async () => {
        if (!localItem) return;

        setIsCalculating(true);
        setError(null);
        try {
            const mergedProperties = getCombinedParentProps();

            const requestPayload = {
                basePrice: 0,
                productId: Number(localItem.productId),
                quantity: Number(localItem.quantity) || 1,
                length: Number(localItem.length) || 0,
                width: Number(localItem.width) || 0,
                depth: Number(localItem.depth) || 0,
                propertyValues: mergedProperties.map(p => ({
                    propertyId: p.propertyId,
                    propertyValue: p.value
                })),
            };

            const result = await pricingApi.calculatePrice(requestPayload);
            console.log('[ItemDetailsModal] Calculation result:', result);
            setLocalCalcResult(result);
        } catch (error: any) {
            console.error('Failed to calculate price:', error);
            setError(error?.response?.status === 401 ? 'Ошибка авторизации' : 'Ошибка расчета цены');
        } finally {
            setIsCalculating(false);
        }
    }, [localItem, getCombinedParentProps]);

    // Автоматический расчет при открытии, если результат отсутствует
    useEffect(() => {
        if (open && localItem && !localCalcResult) {
            handleRecalculate();
        }
    }, [open, localItem, localCalcResult, handleRecalculate]);

    // Автоматический пересчет при изменении свойств (с дебаунсом)
    useEffect(() => {
        if (open && localItem?.properties) {
            const timer = setTimeout(() => {
                handleRecalculate();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [
        localItem?.properties ? JSON.stringify(localItem.properties) : '',
        open,
        handleRecalculate
    ]);

    if (!localItem) return null;

    const handlePropertiesChange = (newProperties: OrderPropertyDto[]) => {
        const updatedItem = { ...localItem, properties: newProperties };

        // Глубокое рекурсивное наследование (INHERITS)
        const { updatedValues, hasChanges } = applyDeepInheritance(
            nestedProperties,
            getCombinedParentProps(), // Тут важно использовать актуальные смерженные свойства
            nestedValues
        );

        if (hasChanges) {
            setNestedValues(updatedValues);
            updatedItem.nestedProperties = updatedValues;
        }

        setLocalItem(updatedItem);
        onSave(updatedItem);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
            <DialogTitle>
                <Box>
                    <Typography variant="h6">Детали позиции</Typography>
                    {itemName && <Typography variant="subtitle2" color="text.secondary">{itemName}</Typography>}
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Дополнительные свойства
                    </Typography>

                    <DynamicPropertyForm
                        headerId={headerId}
                        productId={Number(localItem.productId)}
                        values={localItem.properties || []}
                        onChange={handlePropertiesChange}
                        productProperties={productProps}
                    />

                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 3 }}>
                        В выпадающем списке ниже доступны к активации дополнительные (скрытые) свойства, предусмотренные номенклатурой.
                    </Typography>

                    {availablePropertiesToAdd.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-end', bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                                <InputLabel id="add-prop-label">Доступные свойства</InputLabel>
                                <Select
                                    labelId="add-prop-label"
                                    value={selectedPropToAdd}
                                    label="Доступные свойства"
                                    onChange={(e) => setSelectedPropToAdd(e.target.value)}
                                >
                                    {availablePropertiesToAdd.map(p => (
                                        <MenuItem key={p.propertyId} value={p.propertyId}>
                                            {p.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={handleAddProperty}
                                disabled={!selectedPropToAdd}
                                sx={{ height: 40 }}
                            >
                                Активировать
                            </Button>
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 1 }}>
                            Доступных для активации свойств нет
                        </Typography>
                    )}
                </Box>

                {/* Вложенные компоненты (вкладки) */}
                {nestedProperties.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <NestedPropertyTabs
                            nestedNodes={nestedProperties}
                            parentProperties={getCombinedParentProps()}
                            nestedValues={nestedValues}
                            onNestedChange={handleNestedPropertiesChange}
                            isLoading={nestedLoading}
                        />
                    </Box>
                )}

                {localCalcResult && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Состав изделия (BOM) - ВЫНЕСЛИ ИЗ АККОРДЕОНА ДЛЯ ВИДИМОСТИ */}
                        {localCalcResult.components && localCalcResult.components.length > 0 ? (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'info.light', borderRadius: 1, bgcolor: 'rgba(2, 136, 209, 0.03)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'info.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    🧱 Состав изделия (Деталировка)
                                </Typography>
                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Деталь</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, py: 0.5 }}>L (мм)</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, py: 0.5 }}>W (мм)</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, py: 0.5 }}>T (мм)</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, py: 0.5 }}>Кол-во</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {localCalcResult.components.map((comp: any, i: number) => (
                                                <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ py: 0.5 }}>{comp.name}</TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5 }}>{comp.length}</TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5 }}>{comp.width}</TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5 }}>{comp.depth || 0}</TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5 }}>{comp.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ p: 1.5, border: '1px dashed', borderColor: 'warning.main', borderRadius: 1, bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                                    ⚠️ Деталировка пуста. Проверьте технологические схемы для этой номенклатуры.
                                </Typography>
                            </Box>
                        )}

                        <Accordion disableGutters elevation={0} sx={{ border: '1px solid #eee', '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    📊 Детали расчета цены
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Основные показатели */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            💰 Основные данные
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {error && (
                                                <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                                                    {error}
                                                </Typography>
                                            )}
                                            <Button
                                                size="small"
                                                onClick={handleRecalculate}
                                                disabled={isCalculating}
                                                variant="text"
                                                sx={{ minWidth: 'auto', px: 1 }}
                                            >
                                                {isCalculating ? 'Расчет...' : '🔄'}
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, fontSize: '0.875rem', pl: 2 }}>
                                        <Box sx={{ color: 'text.secondary' }}>Базовая цена:</Box>
                                        <Box sx={{ fontWeight: 600 }}>{localCalcResult.basePrice} ₽</Box>
                                        <Box sx={{ color: 'text.secondary' }}>Размеры:</Box>
                                        <Box>
                                            {(() => {
                                                const length = localCalcResult.dimensions?.length || Number(localItem.length) || 0;
                                                const width = localCalcResult.dimensions?.width || Number(localItem.width) || 0;
                                                const area = (length * width / 1000000);
                                                return `${length} × ${width} мм (S = ${area.toFixed(4)} m²)`;
                                            })()}
                                        </Box>
                                        <Box sx={{ color: 'text.secondary' }}>Количество:</Box>
                                        <Box>{localCalcResult.quantity} шт</Box>
                                        <Box sx={{ color: 'text.secondary' }}>Тип единиц:</Box>
                                        <Box>{localCalcResult.unitType === 'm2' ? 'м²' : localCalcResult.unitType === 'linear_meter' ? 'п.м.' : 'шт'}</Box>
                                    </Box>
                                </Box>


                                {/* Модификаторы */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'secondary.main' }}>
                                        🔧 Примененные модификаторы
                                    </Typography>
                                    {localCalcResult.modifiersApplied?.length > 0 ? (
                                        <Box sx={{ pl: 2 }}>
                                            {localCalcResult.modifiersApplied.map((m, i) => {
                                                const property = localItem.properties?.find(p => p.propertyId === m.propertyId)
                                                    || sectionProperties?.find(p => p.propertyId === m.propertyId);

                                                // Если есть связь со свойством, показываем "Имя: Значение"
                                                // Иначе показываем название модификатора
                                                let displayName = m.name;
                                                if (property) {
                                                    const valueText = m.propertyValue || property.value;
                                                    displayName = `${property.propertyName}: ${valueText}`;
                                                } else if (m.propertyValue) {
                                                    displayName = `${m.name}: ${m.propertyValue}`;
                                                }

                                                const appliedVal = typeof m.appliedValue === 'number' ? m.appliedValue : 0;

                                                return (
                                                    <Box key={i} sx={{ mb: 0.5, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ color: 'text.secondary', minWidth: 20 }}>{i + 1}.</Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box component="span" sx={{ fontWeight: 500 }}>{displayName}</Box>
                                                        </Box>
                                                        <Box sx={{ fontWeight: 600, color: appliedVal >= 0 ? 'success.main' : 'error.main', minWidth: 100, textAlign: 'right' }}>
                                                            {appliedVal > 0 ? '+' : ''}{appliedVal.toFixed(2)} ₽
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    ) : (
                                        <Box sx={{ pl: 2, fontStyle: 'italic', color: 'text.secondary', fontSize: '0.875rem' }}>
                                            Модификаторы не применялись
                                        </Box>
                                    )}
                                </Box>

                                {/* Итоговая цена */}
                                <Box sx={{ pt: 1, borderTop: '2px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>💵 Итоговая цена:</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                            {(localCalcResult.finalPrice || 0).toFixed(2)} ₽
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* JSON Debug */}
                                <Accordion disableGutters elevation={0} sx={{ border: '1px dashed #ccc', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 'auto', py: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                            🐞 Technical Debug (JSON)
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 1 }}>
                                        <Box sx={{ fontSize: '0.6rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', bgcolor: '#1e1e1e', color: '#d4d4d4', p: 1, borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                                            {JSON.stringify({
                                                calculation: localCalcResult,
                                                nestedValues: nestedValues,
                                            }, null, 2)}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog >
    );
};
