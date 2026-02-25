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
import type { CreateOrderItemDto, OrderPropertyDto } from '@shared/api/order/types';
import type { PriceCalculationResult } from '@shared/api/pricing/types';
import { pricingApi } from '@shared/api/pricing';

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
    // Локальное состояние для редактирования, чтобы UI обновлялся мгновенно
    const [localItem, setLocalItem] = useState<CreateOrderItemDto | null>(item);

    // Синхронизация удалена, так как используем key={index} в родительском компоненте для сброса состояния
    // useEffect(() => {
    //    setLocalItem(item);
    // }, [item]);

    const [localCalcResult, setLocalCalcResult] = useState<PriceCalculationResult | undefined>(calculationResult);
    const [isCalculating, setIsCalculating] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Обновить локальный результат, когда приходит новый извне
    useEffect(() => {
        setLocalCalcResult(calculationResult);
    }, [calculationResult]);

    const handleRecalculate = useCallback(async () => {
        if (!localItem) return;

        setIsCalculating(true);
        setError(null);
        try {
            // Слияние свойств: свойства позиции > свойства секции
            // Свойства позиции идут ПЕРВЫМИ, чтобы иметь приоритет (reduce сохраняет первое вхождение)
            const mergedProperties = [
                ...(localItem.properties || []),
                ...(sectionProperties || [])
            ].reduce((acc, curr) => {
                if (!acc.find(p => p.propertyId === curr.propertyId)) {
                    acc.push(curr);
                }
                return acc;
            }, [] as OrderPropertyDto[]);

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

            setLocalCalcResult(result);
        } catch (error: any) {
            console.error('Failed to calculate price:', error);
            if (error?.response?.status === 401) {
                setError('Ошибка авторизации. Обновите страницу или перезайдите.');
            } else {
                setError('Ошибка расчета цены');
            }
        } finally {
            setIsCalculating(false);
        }
    }, [localItem, sectionProperties]);

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
        setLocalItem(updatedItem); // Мгновенное обновление UI
        onSave(updatedItem); // Отправка в родительский компонент
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Здесь можно активировать или изменить свойства конкретно для этой позиции.
                        Значения, установленные здесь, переопределяют значения секции.
                    </Typography>

                    <DynamicPropertyForm
                        headerId={headerId}
                        values={localItem.properties || []}
                        onChange={handlePropertiesChange}
                    />
                </Box>

                {localCalcResult && (
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
                                                const appliedVal = typeof m.appliedValue === 'number' ? m.appliedValue : 0;
                                                const typeLabel = m.modifierType === 'fixed_amount' ? 'фикс. сумма' :
                                                    m.modifierType === 'percentage' ? 'процент' :
                                                        m.modifierType === 'multiplier' ? 'множитель' : m.modifierType;

                                                // Форматирование значения модификатора
                                                let valueDisplay = '';
                                                if (m.value !== undefined && m.value !== null) {
                                                    if (m.modifierType === 'multiplier') {
                                                        valueDisplay = `(*${m.value})`;
                                                    } else if (m.modifierType === 'percentage') {
                                                        valueDisplay = `(${m.value > 0 ? '+' : ''}${m.value}%)`;
                                                    } else if (m.modifierType === 'fixed_amount') {
                                                        valueDisplay = `(${m.value > 0 ? '+' : ''}${m.value})`;
                                                    } else {
                                                        valueDisplay = `(${m.value})`;
                                                    }
                                                }

                                                // Найти имя свойства из localItem.properties или sectionProperties
                                                const property = localItem.properties?.find(p => p.propertyId === m.propertyId)
                                                    || sectionProperties?.find(p => p.propertyId === m.propertyId);
                                                const displayName = property
                                                    ? `${property.propertyName}: ${m.propertyValue || property.value}`
                                                    : m.propertyValue
                                                        ? `ДС: ${m.propertyValue}`
                                                        : m.name;

                                                return (
                                                    <Box key={i} sx={{ mb: 0.5, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ color: 'text.secondary', minWidth: 20 }}>{i + 1}.</Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box component="span" sx={{ fontWeight: 500 }}>
                                                                {displayName} {valueDisplay && <Box component="span" sx={{ color: 'primary.main', fontWeight: 600, ml: 0.5 }}>{valueDisplay}</Box>}
                                                            </Box>
                                                            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', ml: 1 }}>({typeLabel})</Box>
                                                            {m.propertyId && (
                                                                <Box component="span" sx={{ fontSize: '0.65rem', ml: 1, color: 'warning.main' }}>
                                                                    [ID:{m.propertyId} val:"{m.propertyValue}"]
                                                                </Box>
                                                            )}
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
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            💵 Итоговая цена:
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                            {(localCalcResult.finalPrice || 0).toFixed(2)} ₽
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* JSON Debug (свернуто по умолчанию) */}
                                <Accordion disableGutters elevation={0} sx={{ border: '1px dashed #ccc', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 'auto', py: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                            🐞 Technical Debug (JSON)
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 1 }}>
                                        <Box sx={{ fontSize: '0.6rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', bgcolor: '#1e1e1e', color: '#d4d4d4', p: 1, borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                                            {JSON.stringify(localCalcResult, null, 2)}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog >
    );
};
