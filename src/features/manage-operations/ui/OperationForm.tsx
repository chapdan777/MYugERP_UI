/**
 * @file Форма создания/редактирования производственной операции
 * @description Модальная форма для управления операциями
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Box,
    Grid,
    InputAdornment,
} from '@mui/material';
import type { Operation, CreateOperationDto, UpdateOperationDto, OperationCalculationType } from '../model/types';
import { CALCULATION_TYPE_LABELS, CALCULATION_TYPES } from '../model/types';

interface OperationFormProps {
    /** Открыто ли окно */
    open: boolean;
    /** Редактируемая операция (null для создания) */
    operation: Operation | null;
    /** Обработчик сохранения */
    onSave: (dto: CreateOperationDto | UpdateOperationDto, id?: number) => Promise<void>;
    /** Обработчик закрытия */
    onClose: () => void;
}

/**
 * Форма создания/редактирования производственной операции
 */
export const OperationForm: React.FC<OperationFormProps> = ({
    open,
    operation,
    onSave,
    onClose,
}) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [calculationType, setCalculationType] = useState<OperationCalculationType>('PER_PIECE');
    const [defaultTimePerUnit, setDefaultTimePerUnit] = useState(0);
    const [defaultRatePerUnit, setDefaultRatePerUnit] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = !!operation;

    // Сброс формы при открытии/закрытии
    useEffect(() => {
        if (open) {
            if (operation) {
                setCode(operation.code);
                setName(operation.name);
                setDescription(operation.description || '');
                setCalculationType(operation.calculationType);
                setDefaultTimePerUnit(operation.defaultTimePerUnit);
                setDefaultRatePerUnit(operation.defaultRatePerUnit);
                setIsActive(operation.isActive);
            } else {
                setCode('');
                setName('');
                setDescription('');
                setCalculationType('PER_PIECE');
                setDefaultTimePerUnit(0);
                setDefaultRatePerUnit(0);
                setIsActive(true);
            }
        }
    }, [open, operation]);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            if (isEditMode) {
                const dto: UpdateOperationDto = {
                    name,
                    description: description || null,
                    calculationType,
                    defaultTimePerUnit,
                    defaultRatePerUnit,
                    isActive,
                };
                await onSave(dto, operation.id);
            } else {
                const dto: CreateOperationDto = {
                    code,
                    name,
                    description: description || null,
                    calculationType,
                    defaultTimePerUnit,
                    defaultRatePerUnit,
                    isActive,
                };
                await onSave(dto);
            }
            onClose();
        } catch (error) {
            console.error('Ошибка сохранения операции:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const isValid = code.trim() && name.trim();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isEditMode ? 'Редактировать операцию' : 'Новая операция'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                            <TextField
                                label="Код"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                fullWidth
                                size="small"
                                disabled={isEditMode}
                                required
                                placeholder="ОП-001"
                                inputProps={{ maxLength: 20 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 8 }}>
                            <TextField
                                label="Название"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                size="small"
                                required
                                placeholder="Фрезеровка"
                                inputProps={{ maxLength: 100 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Описание"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                placeholder="Описание операции (опционально)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Тип расчёта</InputLabel>
                                <Select
                                    value={calculationType}
                                    label="Тип расчёта"
                                    onChange={(e) =>
                                        setCalculationType(e.target.value as OperationCalculationType)
                                    }
                                >
                                    {CALCULATION_TYPES.map((value) => (
                                        <MenuItem key={value} value={value}>
                                            {CALCULATION_TYPE_LABELS[value]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Норма времени"
                                type="number"
                                value={defaultTimePerUnit}
                                onChange={(e) => setDefaultTimePerUnit(Number(e.target.value))}
                                fullWidth
                                size="small"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">мин</InputAdornment>,
                                }}
                                inputProps={{ min: 0, step: 0.1 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Расценка по умолчанию"
                                type="number"
                                value={defaultRatePerUnit}
                                onChange={(e) => setDefaultRatePerUnit(Number(e.target.value))}
                                fullWidth
                                size="small"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                }
                                label="Активна"
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSaving}>
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isValid || isSaving}
                >
                    {isSaving ? 'Сохранение...' : isEditMode ? 'Сохранить' : 'Создать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
