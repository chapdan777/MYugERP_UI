import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    FormHelperText,
    CircularProgress,
    TextField
} from '@mui/material';
import { useProperties } from '../../manage-properties/model/property.hooks';
import { usePropertyValues } from '../../manage-properties/model/property-value.hooks';
import { DependencyType } from '../model/types';
import type { CreatePropertyDependencyDto } from '../model/types';

interface PropertyDependencyFormProps {
    initialSourcePropertyId?: number;
    onSuccess: () => void;
    onCancel: () => void;
    createDependency: (dto: CreatePropertyDependencyDto) => Promise<any>;
}

export const PropertyDependencyForm: React.FC<PropertyDependencyFormProps> = ({
    initialSourcePropertyId,
    onSuccess,
    onCancel,
    createDependency
}) => {
    const { properties, isLoading: isLoadingProps } = useProperties();

    const [sourcePropertyId, setSourcePropertyId] = useState<number | ''>(initialSourcePropertyId || '');
    const [targetPropertyId, setTargetPropertyId] = useState<number | ''>('');
    const [dependencyType, setDependencyType] = useState<DependencyType>(DependencyType.SETS_VALUE);
    const [sourceValue, setSourceValue] = useState<string>('');
    const [targetValue, setTargetValue] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetched values
    const { propertyValues: sourcePropertyValues } = usePropertyValues(typeof sourcePropertyId === 'number' ? sourcePropertyId : undefined);
    const { propertyValues: targetPropertyValues } = usePropertyValues(typeof targetPropertyId === 'number' ? targetPropertyId : undefined);

    const [sourceValuesList, setSourceValuesList] = useState<any[]>([]);
    const [targetValuesList, setTargetValuesList] = useState<any[]>([]);

    // Memoize selected properties
    const selectedSourceProperty = React.useMemo(() =>
        properties?.find((p: any) => String(p.id) === String(sourcePropertyId)),
        [properties, sourcePropertyId]
    );

    const selectedTargetProperty = React.useMemo(() =>
        properties?.find((p: any) => String(p.id) === String(targetPropertyId)),
        [properties, targetPropertyId]
    );

    const getPossibleValues = (prop: any) => {
        if (!prop?.possibleValues) return [];
        if (Array.isArray(prop.possibleValues)) return prop.possibleValues;
        if (typeof prop.possibleValues === 'string') {
            try {
                const parsed = JSON.parse(prop.possibleValues);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.error('Failed to parse possibleValues:', e);
                // Try splitting by comma if JSON parse fails
                return prop.possibleValues.split(',').map((s: string) => s.trim());
            }
        }
        return [];
    };

    // Update source values list when data or fallback changes
    useEffect(() => {
        if (sourcePropertyId && selectedSourceProperty) {
            // Special handling for boolean
            if (selectedSourceProperty.dataType === 'boolean') {
                setSourceValuesList([
                    { id: 'true', value: 'true' },
                    { id: 'false', value: 'false' }
                ]);
                return;
            }

            console.log('DEBUG: Updating values for source property', sourcePropertyId);
            if (sourcePropertyValues && sourcePropertyValues.length > 0) {
                setSourceValuesList(sourcePropertyValues);
            } else {
                // Fallback
                const fallbacks = getPossibleValues(selectedSourceProperty);
                console.log('DEBUG: Fallback values source:', fallbacks);
                if (fallbacks.length > 0) {
                    setSourceValuesList(fallbacks.map((v: string, i: number) => ({
                        id: `local-src-${i}`,
                        value: v
                    })));
                } else {
                    setSourceValuesList([]);
                }
            }
        } else {
            setSourceValuesList([]);
        }
        // Use stringify to prevent loop from unstable array reference
    }, [sourcePropertyId, JSON.stringify(sourcePropertyValues), selectedSourceProperty]);

    // Update target values list when data or fallback changes
    useEffect(() => {
        if (targetPropertyId && selectedTargetProperty) {
            // Special handling for boolean
            if (selectedTargetProperty.dataType === 'boolean') {
                setTargetValuesList([
                    { id: 'true', value: 'true' },
                    { id: 'false', value: 'false' }
                ]);
                return;
            }

            if (targetPropertyValues && targetPropertyValues.length > 0) {
                setTargetValuesList(targetPropertyValues);
            } else {
                // Fallback
                const fallbacks = getPossibleValues(selectedTargetProperty);
                if (fallbacks.length > 0) {
                    setTargetValuesList(fallbacks.map((v: string, i: number) => ({
                        id: `local-tgt-${i}`,
                        value: v
                    })));
                } else {
                    setTargetValuesList([]);
                }
            }
        } else {
            setTargetValuesList([]);
        }
        // Use stringify to prevent loop from unstable array reference
    }, [targetPropertyId, JSON.stringify(targetPropertyValues), selectedTargetProperty]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourcePropertyId || !targetPropertyId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await createDependency({
                sourcePropertyId: Number(sourcePropertyId),
                targetPropertyId: Number(targetPropertyId),
                dependencyType,
                sourceValue: sourceValue || undefined,
                targetValue: targetValue || undefined,
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Ошибка при создании зависимости');
            setIsSubmitting(false);
        }
    };

    if (isLoadingProps) {
        return <CircularProgress />;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
                <Typography color="error" variant="body2">{error}</Typography>
            )}

            {/* Source Property */}
            <FormControl fullWidth disabled={!!initialSourcePropertyId}>
                <InputLabel>Исходное свойство (Если...)</InputLabel>
                <Select
                    value={sourcePropertyId}
                    label="Исходное свойство (Если...)"
                    onChange={(e) => setSourcePropertyId(Number(e.target.value))}
                    required
                >
                    {properties?.filter((p: any) => p.isActive !== false && p.is_active !== false && p.is_active !== 0).map((prop: any) => (
                        <MenuItem key={prop.id} value={prop.id}>
                            {prop.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Source Value */}
            <FormControl fullWidth disabled={!sourcePropertyId}>
                <InputLabel>Значение исходного свойства (равно...)</InputLabel>
                <Select
                    value={sourceValue}
                    label="Значение исходного свойства (равно...)"
                    onChange={(e) => setSourceValue(e.target.value)}
                    displayEmpty
                >
                    <MenuItem value=""><em>Любое значение</em></MenuItem>
                    {sourceValuesList.map((val: any) => (
                        <MenuItem key={val.id} value={val.value}>
                            {val.value}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>Оставьте пустым, если зависимость работает для любого значения</FormHelperText>
            </FormControl>

            {/* Dependency Type */}
            <FormControl fullWidth>
                <InputLabel>Тип зависимости</InputLabel>
                <Select
                    value={dependencyType}
                    label="Тип зависимости"
                    onChange={(e) => setDependencyType(e.target.value as DependencyType)}
                    required
                >
                    <MenuItem value={DependencyType.SETS_VALUE}>Установить значение (SETS_VALUE)</MenuItem>
                    <MenuItem value={DependencyType.REQUIRES}>Требует (REQUIRES)</MenuItem>
                    <MenuItem value={DependencyType.EXCLUDES}>Исключает (EXCLUDES)</MenuItem>
                    <MenuItem value={DependencyType.ENABLES}>Включает (ENABLES)</MenuItem>
                </Select>
            </FormControl>

            {/* Target Property */}
            <FormControl fullWidth>
                <InputLabel>Целевое свойство (То...)</InputLabel>
                <Select
                    value={targetPropertyId}
                    label="Целевое свойство (То...)"
                    onChange={(e) => setTargetPropertyId(Number(e.target.value))}
                    required
                >
                    {properties?.filter((p: any) => String(p.id) !== String(sourcePropertyId) && p.isActive !== false && p.is_active !== false && p.is_active !== 0).map((prop: any) => (
                        <MenuItem key={prop.id} value={prop.id}>
                            {prop.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Target Value (Only for SETS_VALUE) */}
            {dependencyType === DependencyType.SETS_VALUE && targetPropertyId && (
                <>
                    {/* Show TextField for number/string types, Select for select/boolean */}
                    {selectedTargetProperty?.dataType === 'number' || selectedTargetProperty?.dataType === 'string' ? (
                        <FormControl fullWidth>
                            <TextField
                                label="Значение целевого свойства (установить...)"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                                required
                                type={selectedTargetProperty?.dataType === 'number' ? 'number' : 'text'}
                                placeholder={selectedTargetProperty?.dataType === 'number' ? 'Введите число' : 'Введите текст'}
                            />
                        </FormControl>
                    ) : (
                        <FormControl fullWidth>
                            <InputLabel>Значение целевого свойства (установить...)</InputLabel>
                            <Select
                                value={targetValue}
                                label="Значение целевого свойства (установить...)"
                                onChange={(e) => setTargetValue(e.target.value)}
                                required
                            >
                                {targetValuesList.map((val: any) => (
                                    <MenuItem key={val.id} value={val.value}>
                                        {val.value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={onCancel} disabled={isSubmitting}>
                    Отмена
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </Box>
        </Box>
    );
};
