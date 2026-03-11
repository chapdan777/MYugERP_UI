import { useState, useEffect, useCallback, useRef } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { OrderPropertyDto } from '@shared/api/order/types';
import { propertyHeadersApi } from '@shared/api/property-headers';
import { propertyApi } from '@shared/api/property';
import type { Property, PropertyDependency } from '@shared/api/property/types';

interface DynamicPropertyFormProps {
    headerId?: number;
    productId?: number;
    values: OrderPropertyDto[];
    onChange: (values: OrderPropertyDto[]) => void;
    productProperties?: any[]; // Свойства из номенклатуры для доп. сортировки
    filterByPropertyIds?: number[]; // Явный список ID свойств для отображения (если не используется headerId)
}

export const DynamicPropertyForm = ({ headerId, values, onChange, productProperties = [], filterByPropertyIds }: DynamicPropertyFormProps) => {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<Property[]>([]);
    const [dependencies, setDependencies] = useState<PropertyDependency[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Ref для полного списка свойств — нужен чтобы зависимости (sets_value)
    // могли найти целевое свойство, даже если оно не отображается в текущей форме
    const allPropsRef = useRef<Property[]>([]);

    // Ref для отслеживания актуальных значений и предотвращения race condition
    // Когда пользователь быстро меняет несколько свойств, без ref каждый handleChange
    // использует устаревшие значения из props (которые ещё не успели обновиться)
    const valuesRef = useRef(values);
    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

    const loadPropertiesAndDependencies = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Получаем элементы (связи)
            let headerItems: any[] = [];
            let headerPropIds = new Set<number>();

            if (headerId) {
                headerItems = await propertyHeadersApi.getItems(headerId);
                headerPropIds = new Set(headerItems.map((i) => i.propertyId));
            } else if (filterByPropertyIds) {
                headerPropIds = new Set(filterByPropertyIds);
            }

            // 2. Получаем все свойства
            const allProps = await propertyApi.getProperties();
            allPropsRef.current = allProps;

            // 3. Фильтруем свойства, которые разрешены для отображения (по шапке или по фильтру)
            const valuePropIds = new Set(valuesRef.current.map(v => v.propertyId));

            const filteredProps = allProps.filter((p: Property) =>
                headerPropIds.has(p.id) ||
                (headerId ? valuePropIds.has(p.id) : false) // добавляем выбранные свойства только если это шапка (чтобы не тянуть родительские свойства во вложенные формы)
            );

            // 4. Сортируем: 
            // - Сначала те, что есть в шапке (по sortOrder)
            // - Затем те, что есть в номенклатуре (по displayOrder)
            // - Затем остальные (по ID)
            const sortedProps = filteredProps.sort((a: Property, b: Property) => {
                const itemA = headerItems.find(i => i.propertyId === a.id);
                const itemB = headerItems.find(i => i.propertyId === b.id);

                if (itemA || itemB) {
                    // Если хотя бы одно в шапке
                    const orderA = itemA ? itemA.sortOrder : 1000;
                    const orderB = itemB ? itemB.sortOrder : 1000;
                    if (orderA !== orderB) return orderA - orderB;
                }

                // Если оба не в шапке или порядок одинаковый, смотрим на номенклатуру
                const prodPropA = productProperties.find(p => p.propertyId === a.id);
                const prodPropB = productProperties.find(p => p.propertyId === b.id);

                if (prodPropA || prodPropB) {
                    const orderA = prodPropA ? prodPropA.displayOrder : 2000;
                    const orderB = prodPropB ? prodPropB.displayOrder : 2000;
                    if (orderA !== orderB) return orderA - orderB;
                }

                return a.id - b.id;
            });

            setProperties(sortedProps);

            // 5. Загружаем зависимости для этих свойств
            // Нужно знать правила, где эти свойства являются ИСТОЧНИКОМ
            const allDeps: PropertyDependency[] = [];
            await Promise.all(sortedProps.map(async (p: Property) => {
                try {
                    const deps = await propertyApi.getDependencies(p.id);
                    if (deps.asSource) {
                        allDeps.push(...deps.asSource);
                    }
                } catch (err) {
                    console.warn(`Failed to load dependencies for property ${p.id}`, err);
                }
            }));
            setDependencies(allDeps);
            console.log(`Loaded ${allDeps.length} Property Dependencies for `, sortedProps.map(p => p.name));

        } catch (error) {
            console.error('Failed to load properties for header', error);
        } finally {
            setLoading(false);
        }
    }, [headerId, filterByPropertyIds, refreshKey]);

    useEffect(() => {
        if (headerId || filterByPropertyIds) {
            loadPropertiesAndDependencies();
        }
    }, [headerId, filterByPropertyIds, refreshKey, loadPropertiesAndDependencies]);

    // Снято: цикл обновлений properties -> useEffect -> load -> properties вызывал мерцание
    // Если нужно обновить список при изменении значений снаружи, лучше использовать refreshKey или явный триггер

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleChange = (property: Property, value: string) => {
        // Используем valuesRef.current вместо values prop для предотвращения race condition
        let newValues = [...valuesRef.current];

        const index = newValues.findIndex(v => v.propertyId === property.id);

        const newValue: OrderPropertyDto = {
            propertyId: property.id,
            propertyName: property.name,
            propertyCode: property.code,
            value: value,
            variableName: property.variableName,
        };

        if (index >= 0) {
            newValues[index] = newValue;
        } else {
            newValues.push(newValue);
        }

        // --- Логика динамических зависимостей ---
        // Находим зависимости, где это свойство является ИСТОЧНИКОМ
        console.log(`[Dependencies] handleChange: property=${property.name}(id=${property.id}), value="${value}", total deps loaded: ${dependencies.length}`);

        const relevantDeps = dependencies.filter(d =>
            d.sourcePropertyId === property.id &&
            d.dependencyType === 'sets_value' && // DependencyType.SETS_VALUE
            d.isActive
        );

        console.log(`[Dependencies] Found ${relevantDeps.length} relevant sets_value deps for property ${property.name}`, relevantDeps);

        relevantDeps.forEach(dep => {
            // Проверяем, выполнено ли условие
            // Если dep.sourceValue = null, применяется для ЛЮБОГО значения (всегда срабатывает)
            // Если dep.sourceValue установлен, должно совпадать с текущим значением
            const isTriggered = !dep.sourceValue || dep.sourceValue === value;
            console.log(`[Dependencies] Checking dep id=${dep.id}: sourceValue="${dep.sourceValue}" vs value="${value}", triggered=${isTriggered}`);

            if (isTriggered && dep.targetValue) {
                // Находим целевое свойство в списке допустимых свойств для этой шапки
                // Ищем целевое свойство сначала в видимой форме, затем в полном справочнике (fallback)
                const targetProp = properties.find(p => p.id === dep.targetPropertyId)
                    || allPropsRef.current.find(p => p.id === dep.targetPropertyId);
                console.log(`[Dependencies] Target prop id=${dep.targetPropertyId} found: ${!!targetProp}`);

                if (targetProp) {
                    const targetIndex = newValues.findIndex(v => v.propertyId === targetProp.id);
                    const targetNewValue: OrderPropertyDto = {
                        propertyId: targetProp.id,
                        propertyName: targetProp.name,
                        propertyCode: targetProp.code,
                        value: dep.targetValue,
                        variableName: targetProp.variableName,
                    };

                    if (targetIndex >= 0) {
                        newValues[targetIndex] = targetNewValue;
                    } else {
                        newValues.push(targetNewValue);
                    }
                    console.log(`Dependency applied: ${property.name} (${value}) -> Set ${targetProp.name} to ${dep.targetValue}`);
                }
            }
        });

        // Обновляем ref СРАЗУ, чтобы следующий handleChange получил актуальные значения
        // (не дожидаясь пока React обработает onChange -> setState -> re-render -> useEffect)
        valuesRef.current = newValues;
        onChange(newValues);
    };

    // Используем valuesRef.current вместо values prop, чтобы dropdown 
    // всегда показывал актуальное значение даже если props ещё не обновились
    const getValue = (propId: number) => {
        return valuesRef.current.find(v => v.propertyId === propId)?.value || '';
    };

    /**
     * Преобразует возможные значения из строки (JSON или запятые) в массив
     */
    const getOptions = (prop: Property): string[] => {
        const values: any = prop.possibleValues;
        if (!values) return [];

        if (Array.isArray(values)) return values;

        if (typeof values === 'string') {
            try {
                // 1. Пытаемся распарсить как JSON
                const parsed = JSON.parse(values);
                if (Array.isArray(parsed)) return parsed as string[];
            } catch {
                // 2. Если не JSON — пробуем запятые
                return values.split(',').map((v: string) => v.trim()).filter(Boolean);
            }
        }

        return [];
    };

    if (loading) return <CircularProgress size={20} />;

    if (properties.length === 0) {
        return <Typography variant="body2" color="text.secondary">Нет свойств в этой шапке</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Основные данные
                </Typography>
                <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={loading}
                    title="Обновить список значений"
                    sx={{ color: 'primary.main' }}
                >
                    <RefreshIcon fontSize="small" />
                </IconButton>
            </Box>
            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
                {properties.map((prop) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={prop.id} sx={{ pl: 2, pt: 2 }}>
                        {prop.dataType !== 'boolean' && (
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prop.name}
                            </Typography>
                        )}
                        {prop.dataType === 'boolean' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', height: 40 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={getValue(prop.id) === 'true'}
                                            onChange={(e) => handleChange(prop, String(e.target.checked))}
                                            size="small"
                                        />
                                    }
                                    label={prop.name}
                                    sx={{ m: 0 }}
                                />
                            </Box>
                        ) : prop.dataType === 'select' || prop.dataType === 'list' || prop.dataType === 'multi_select' ? (
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={getValue(prop.id)}
                                onChange={(e) => handleChange(prop, e.target.value)}
                                slotProps={{
                                    select: {
                                        MenuProps: { PaperProps: { sx: { maxHeight: 300 } } }
                                    }
                                }}
                            >
                                {getOptions(prop).map((val) => (
                                    <MenuItem key={val} value={val}>
                                        {val}
                                    </MenuItem>
                                ))}
                                {getOptions(prop).length === 0 && (
                                    <MenuItem disabled value="">
                                        <em>Список пуст</em>
                                    </MenuItem>
                                )}
                            </TextField>
                        ) : (
                            <TextField
                                fullWidth
                                size="small"
                                value={getValue(prop.id)}
                                onChange={(e) => handleChange(prop, e.target.value)}
                            />
                        )}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
