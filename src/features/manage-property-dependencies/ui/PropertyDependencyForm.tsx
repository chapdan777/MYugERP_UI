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
    TextField,
    IconButton,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useProperties } from '../../manage-properties/model/property.hooks';
import { usePropertyValues } from '../../manage-properties/model/property-value.hooks';
import { DependencyType } from '../model/types';
import type { CreatePropertyDependencyDto } from '../model/types';

interface TargetConfig {
    id: string;
    targetPropertyId: number | '';
    dependencyType: DependencyType;
    targetValue: string;
}

interface PropertyDependencyFormProps {
    initialSourcePropertyId?: number;
    initialTargets?: TargetConfig[]; // Support for pre-filling targets when Copying or Editing
    editDependencyId?: number; // If present, implies Edit mode
    onSuccess: () => void;
    onCancel: () => void;
    createDependency?: (dto: CreatePropertyDependencyDto) => Promise<any>;
    updateDependency?: (id: number, dto: any) => Promise<any>;
}

// Utility to parse possible values safely
const getPossibleValues = (prop: any) => {
    if (!prop?.possibleValues) return [];
    if (Array.isArray(prop.possibleValues)) return prop.possibleValues;
    if (typeof prop.possibleValues === 'string') {
        try {
            const parsed = JSON.parse(prop.possibleValues);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            return prop.possibleValues.split(',').map((s: string) => s.trim());
        }
    }
    return [];
};

// Sub-component to encapsulate hooks and state for a single Target config
const TargetConfigRow: React.FC<{
    target: TargetConfig;
    properties: any[];
    sourcePropertyId: number | '';
    onChange: (t: TargetConfig) => void;
    onRemove: () => void;
    canRemove: boolean;
}> = ({ target, properties, sourcePropertyId, onChange, onRemove, canRemove }) => {
    const { propertyValues: targetPropertyValues } = usePropertyValues(typeof target.targetPropertyId === 'number' ? target.targetPropertyId : undefined);
    const [targetValuesList, setTargetValuesList] = useState<any[]>([]);

    const selectedTargetProperty = React.useMemo(() =>
        properties?.find((p: any) => String(p.id) === String(target.targetPropertyId)),
        [properties, target.targetPropertyId]
    );

    useEffect(() => {
        if (target.targetPropertyId && selectedTargetProperty) {
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
    }, [target.targetPropertyId, JSON.stringify(targetPropertyValues), selectedTargetProperty]);

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Целевое свойство (То...)</InputLabel>
                    <Select
                        value={target.targetPropertyId}
                        label="Целевое свойство (То...)"
                        onChange={(e) => onChange({ ...target, targetPropertyId: Number(e.target.value) })}
                        required
                    >
                        {properties?.filter((p: any) => String(p.id) !== String(sourcePropertyId) && p.isActive !== false && p.is_active !== false && p.is_active !== 0).map((prop: any) => (
                            <MenuItem key={prop.id} value={prop.id}>
                                {prop.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Тип зависимости</InputLabel>
                    <Select
                        value={target.dependencyType}
                        label="Тип зависимости"
                        onChange={(e) => onChange({ ...target, dependencyType: e.target.value as DependencyType })}
                        required
                    >
                        <MenuItem value={DependencyType.SETS_VALUE}>Установить значение (SETS_VALUE)</MenuItem>
                        <MenuItem value={DependencyType.INHERITS}>Наследует (INHERITS)</MenuItem>
                        <MenuItem value={DependencyType.REQUIRES}>Требует (REQUIRES)</MenuItem>
                        <MenuItem value={DependencyType.EXCLUDES}>Исключает (EXCLUDES)</MenuItem>
                        <MenuItem value={DependencyType.ENABLES}>Включает (ENABLES)</MenuItem>
                    </Select>
                </FormControl>

                {target.dependencyType === DependencyType.SETS_VALUE && target.targetPropertyId && (
                    <>
                        {selectedTargetProperty?.dataType === 'number' || selectedTargetProperty?.dataType === 'string' ? (
                            <FormControl fullWidth>
                                <TextField
                                    label="Значение целевого свойства (установить...)"
                                    value={target.targetValue}
                                    onChange={(e) => onChange({ ...target, targetValue: e.target.value })}
                                    required
                                    type={selectedTargetProperty?.dataType === 'number' ? 'number' : 'text'}
                                    placeholder={selectedTargetProperty?.dataType === 'number' ? 'Введите число' : 'Введите текст'}
                                />
                            </FormControl>
                        ) : (
                            <FormControl fullWidth>
                                <InputLabel>Значение целевого свойства (установить...)</InputLabel>
                                <Select
                                    value={target.targetValue}
                                    label="Значение целевого свойства (установить...)"
                                    onChange={(e) => onChange({ ...target, targetValue: e.target.value })}
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
            </Box>

            {canRemove && (
                <IconButton color="error" onClick={onRemove} title="Удалить это целевое свойство">
                    <DeleteIcon />
                </IconButton>
            )}
        </Box>
    );
};

export const PropertyDependencyForm: React.FC<PropertyDependencyFormProps> = ({
    initialSourcePropertyId,
    initialTargets,
    editDependencyId,
    onSuccess,
    onCancel,
    createDependency,
    updateDependency
}) => {
    const { properties, isLoading: isLoadingProps } = useProperties();
    const isEditing = !!editDependencyId;

    const [sourcePropertyId, setSourcePropertyId] = useState<number | ''>(initialSourcePropertyId || '');
    const [sourceValue, setSourceValue] = useState<string>('');
    const [targets, setTargets] = useState<TargetConfig[]>(
        initialTargets && initialTargets.length > 0 ? initialTargets : [
            { id: Date.now().toString(), targetPropertyId: '', dependencyType: DependencyType.SETS_VALUE, targetValue: '' }
        ]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Source values
    const { propertyValues: sourcePropertyValues } = usePropertyValues(typeof sourcePropertyId === 'number' ? sourcePropertyId : undefined);
    const [sourceValuesList, setSourceValuesList] = useState<any[]>([]);

    const selectedSourceProperty = React.useMemo(() =>
        properties?.find((p: any) => String(p.id) === String(sourcePropertyId)),
        [properties, sourcePropertyId]
    );

    useEffect(() => {
        if (sourcePropertyId && selectedSourceProperty) {
            if (selectedSourceProperty.dataType === 'boolean') {
                setSourceValuesList([
                    { id: 'true', value: 'true' },
                    { id: 'false', value: 'false' }
                ]);
                return;
            }

            if (sourcePropertyValues && sourcePropertyValues.length > 0) {
                setSourceValuesList(sourcePropertyValues);
            } else {
                const fallbacks = getPossibleValues(selectedSourceProperty);
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
    }, [sourcePropertyId, JSON.stringify(sourcePropertyValues), selectedSourceProperty]);

    const addTarget = () => {
        setTargets(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(),
            targetPropertyId: '',
            dependencyType: DependencyType.SETS_VALUE,
            targetValue: ''
        }]);
    };

    const removeTarget = (id: string) => {
        setTargets(prev => prev.filter(t => t.id !== id));
    };

    const updateTarget = (id: string, updatedTarget: TargetConfig) => {
        setTargets(prev => prev.map(t => t.id === id ? updatedTarget : t));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all targets
        const invalidTarget = targets.find(t => !t.targetPropertyId || (t.dependencyType === DependencyType.SETS_VALUE && !t.targetValue));
        if (!sourcePropertyId || invalidTarget) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (isEditing && updateDependency && createDependency) {
                // В режиме редактирования:
                // Первая цель - это та, которую мы редактируем.
                // Остальные цели - новые, их нужно создать.
                const firstTarget = targets[0];
                const newTargets = targets.slice(1);

                const updatePromise = updateDependency(editDependencyId, {
                    sourcePropertyId: Number(sourcePropertyId),
                    targetPropertyId: Number(firstTarget.targetPropertyId),
                    dependencyType: firstTarget.dependencyType,
                    sourceValue: sourceValue || '',
                    targetValue: firstTarget.targetValue || undefined,
                });

                const createPromises = newTargets.map(t => createDependency({
                    sourcePropertyId: Number(sourcePropertyId),
                    targetPropertyId: Number(t.targetPropertyId),
                    dependencyType: t.dependencyType,
                    sourceValue: sourceValue || undefined,
                    targetValue: t.targetValue || undefined,
                }));

                await Promise.all([updatePromise, ...createPromises]);
            } else if (createDependency) {
                // В режиме создания можем создать сразу несколько
                await Promise.all(targets.map(t => createDependency({
                    sourcePropertyId: Number(sourcePropertyId),
                    targetPropertyId: Number(t.targetPropertyId),
                    dependencyType: t.dependencyType,
                    sourceValue: sourceValue || undefined,
                    targetValue: t.targetValue || undefined,
                })));
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Ошибка при сохранении зависимости');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingProps) {
        return <CircularProgress />;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {error && (
                <Typography color="error" variant="body2" sx={{ mb: 1 }}>{error}</Typography>
            )}

            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Условие (Источник)</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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

                    <FormControl fullWidth disabled={!sourcePropertyId}>
                        <InputLabel shrink={true}>Значение исходного свойства (равно...)</InputLabel>
                        <Select
                            value={sourceValue}
                            label="Значение исходного свойства (равно...)"
                            onChange={(e) => setSourceValue(e.target.value)}
                            displayEmpty
                            notched={true}
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
                </Box>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle2" gutterBottom color="primary">Следствия (Целевые свойства)</Typography>
                {targets.map((target, index) => (
                    <TargetConfigRow
                        key={target.id}
                        target={target}
                        properties={properties}
                        sourcePropertyId={sourcePropertyId}
                        onChange={(t) => updateTarget(target.id, t)}
                        onRemove={() => removeTarget(target.id)}
                        // В режиме редактирования первую цель нельзя удалить (т.к. мы редактируем именно ее ID),
                        // остальные (новые) можно удалять.
                        canRemove={
                            (targets.length > 1 && !isEditing) ||
                            (isEditing && index > 0)
                        }
                    />
                ))}

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addTarget}
                    fullWidth
                    sx={{ mt: 1 }}
                >
                    Добавить целевое свойство
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={onCancel} disabled={isSubmitting}>
                    Отмена
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить зависимости'}
                </Button>
            </Box>
        </Box>
    );
};
