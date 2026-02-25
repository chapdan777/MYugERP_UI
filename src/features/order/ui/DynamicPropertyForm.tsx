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
    headerId: number;
    values: OrderPropertyDto[];
    onChange: (values: OrderPropertyDto[]) => void;
}

export const DynamicPropertyForm = ({ headerId, values, onChange }: DynamicPropertyFormProps) => {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<Property[]>([]);
    const [dependencies, setDependencies] = useState<PropertyDependency[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

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
            // 1. Получаем элементы (связи) для этой шапки
            const items = await propertyHeadersApi.getItems(headerId);

            // 2. Получаем все свойства
            const allProps = await propertyApi.getProperties();

            // 3. Фильтруем свойства, которые есть в шапке
            const headerPropIds = new Set(items.map((i) => i.propertyId));
            const filteredProps = allProps.filter((p: Property) => headerPropIds.has(p.id));

            // 4. Сортируем по sortOrder шапки
            const sortedProps = filteredProps.sort((a: Property, b: Property) => {
                const itemA = items.find(i => i.propertyId === a.id);
                const itemB = items.find(i => i.propertyId === b.id);
                return (itemA?.sortOrder || 0) - (itemB?.sortOrder || 0);
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
            console.log('Loaded Property Dependencies:', allDeps);

        } catch (error) {
            console.error('Failed to load properties for header', error);
        } finally {
            setLoading(false);
        }
    }, [headerId, refreshKey]);

    useEffect(() => {
        if (headerId) {
            loadPropertiesAndDependencies();
        }
    }, [headerId, refreshKey, loadPropertiesAndDependencies]);

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
            value: value
        };

        if (index >= 0) {
            newValues[index] = newValue;
        } else {
            newValues.push(newValue);
        }

        // --- Логика динамических зависимостей ---
        // Находим зависимости, где это свойство является ИСТОЧНИКОМ
        const relevantDeps = dependencies.filter(d =>
            d.sourcePropertyId === property.id &&
            d.dependencyType === 'sets_value' && // DependencyType.SETS_VALUE
            d.isActive
        );

        relevantDeps.forEach(dep => {
            // Проверяем, выполнено ли условие
            // Если dep.sourceValue = null, применяется для ЛЮБОГО значения (всегда срабатывает)
            // Если dep.sourceValue установлен, должно совпадать с текущим значением
            const isTriggered = !dep.sourceValue || dep.sourceValue === value;

            if (isTriggered && dep.targetValue) {
                // Находим целевое свойство в списке допустимых свойств для этой шапки
                const targetProp = properties.find(p => p.id === dep.targetPropertyId);

                if (targetProp) {
                    const targetIndex = newValues.findIndex(v => v.propertyId === targetProp.id);
                    const targetOrderProp: OrderPropertyDto = {
                        propertyId: targetProp.id,
                        propertyName: targetProp.name,
                        propertyCode: targetProp.code,
                        value: dep.targetValue
                    };

                    if (targetIndex >= 0) {
                        newValues[targetIndex] = targetOrderProp;
                    } else {
                        newValues.push(targetOrderProp);
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
                        ) : prop.type === 'select' || prop.dataType === 'select' ? (
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
                                {prop.possibleValues?.map((val) => (
                                    <MenuItem key={val} value={val}>
                                        {val}
                                    </MenuItem>
                                ))}
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
