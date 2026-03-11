import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CircularProgress from '@mui/material/CircularProgress';
import type { NestedProductNode } from '../../../entities/product-component-schema/model/types';
import type { OrderPropertyDto } from '@shared/api/order/types';
import { DynamicPropertyForm } from './DynamicPropertyForm';
import { evaluateCondition } from '@shared/lib/formula';

/**
 * Пропсы компонента вкладок вложенных свойств
 */
interface NestedPropertyTabsProps {
    /** Дерево вложенных компонентов */
    nestedNodes: NestedProductNode[];
    /** Свойства родительского компонента для вычисления условий отображения */
    parentProperties?: OrderPropertyDto[];
    /** Текущие значения вложенных свойств: ключ — productId */
    nestedValues: Record<number, OrderPropertyDto[]>;
    /** Обработчик изменения значений вложенных свойств */
    onNestedChange: (productId: number, values: OrderPropertyDto[]) => void;
    /** Признак загрузки дерева */
    isLoading?: boolean;
}

/**
 * Компонент вкладок для навигации по вложенным компонентам изделия
 * @description Отображает вкладки для каждого дочернего компонента (через BOM/childProductId).
 * Каждая вкладка содержит DynamicPropertyForm для управления свойствами дочерней номенклатуры.
 * Поддерживает рекурсивную вложенность (вкладки внутри вкладок).
 */
export const NestedPropertyTabs = ({
    nestedNodes,
    parentProperties = [],
    nestedValues,
    onNestedChange,
    isLoading = false,
}: NestedPropertyTabsProps) => {
    const [activeTab, setActiveTab] = useState(0);

    // Вычисляем видимые узлы на основе свойства conditionFormula и parentProperties
    const visibleNodes = nestedNodes.filter(node =>
        evaluateCondition(node.conditionFormula, parentProperties)
    );

    // Сброс вкладки, если видимых узлов стало меньше, чем текущий индекс вкладки
    useEffect(() => {
        if (visibleNodes.length > 0 && activeTab >= visibleNodes.length) {
            setActiveTab(0);
        }
    }, [visibleNodes.length, activeTab]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                    Загрузка вложенных компонентов...
                </Typography>
            </Box>
        );
    }

    if (visibleNodes.length === 0) {
        return null;
    }

    const currentNode = visibleNodes[activeTab];
    if (!currentNode) return null;

    const currentValues = nestedValues[currentNode.productId] ?? [];

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountTreeIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                    Вложенные компоненты
                </Typography>
                <Chip
                    label={visibleNodes.length}
                    size="small"
                    variant="outlined"
                    color="info"
                />
            </Box>

            <Box sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
            }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        borderBottom: 1,
                        borderColor: 'divider',
                        minHeight: 36,
                        '& .MuiTab-root': {
                            minHeight: 36,
                            py: 0.5,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                        },
                    }}
                >
                    {visibleNodes.map((node) => (
                        <Tab
                            key={node.productId}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span>{node.componentName}</span>
                                    {node.properties.length > 0 && (
                                        <Chip
                                            label={node.properties.length}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                        />
                                    )}
                                    {node.children.length > 0 && (
                                        <AccountTreeIcon sx={{ fontSize: 14, color: 'info.main' }} />
                                    )}
                                </Box>
                            }
                        />
                    ))}
                </Tabs>

                <Box sx={{ p: 2 }}>
                    {/* Информация о компоненте */}
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {currentNode.productName} (ID: {currentNode.productId})
                    </Typography>

                    {/* Форма свойств дочернего компонента */}
                    {currentNode.properties.length > 0 ? (
                        <DynamicPropertyForm
                            filterByPropertyIds={currentNode.properties.map(p => p.propertyId)}
                            productId={currentNode.productId}
                            values={currentValues}
                            onChange={(newValues) => onNestedChange(currentNode.productId, newValues)}
                        />
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            У этого компонента нет дополнительных свойств
                        </Typography>
                    )}

                    {/* Рекурсивный рендер вложенных дочерних компонентов */}
                    {currentNode.children.length > 0 && (
                        <NestedPropertyTabs
                            nestedNodes={currentNode.children}
                            parentProperties={currentValues}
                            nestedValues={nestedValues}
                            onNestedChange={onNestedChange}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
};
