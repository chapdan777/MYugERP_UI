/**
 * @file Форма создания/редактирования статуса заказ-наряда
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    Stack,
} from '@mui/material';
import type { WorkOrderStatus, CreateWorkOrderStatusDto, UpdateWorkOrderStatusDto } from '../model/types';

interface StatusFormProps {
    open: boolean;
    status: WorkOrderStatus | null;
    onSave: (dto: CreateWorkOrderStatusDto | UpdateWorkOrderStatusDto, id?: number) => Promise<void>;
    onClose: () => void;
}

/**
 * Форма статуса заказ-наряда
 */
export const StatusForm: React.FC<StatusFormProps> = ({
    open,
    status,
    onSave,
    onClose,
}) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [color, setColor] = useState('#808080');
    const [sortOrder, setSortOrder] = useState(0);
    const [isInitial, setIsInitial] = useState(false);
    const [isFinal, setIsFinal] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = !!status;

    useEffect(() => {
        if (open) {
            if (status) {
                setCode(status.code);
                setName(status.name);
                setColor(status.color);
                setSortOrder(status.sortOrder);
                setIsInitial(status.isInitial);
                setIsFinal(status.isFinal);
                setIsActive(status.isActive);
            } else {
                setCode('');
                setName('');
                setColor('#808080');
                setSortOrder(0);
                setIsInitial(false);
                setIsFinal(false);
                setIsActive(true);
            }
        }
    }, [open, status]);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            if (isEditMode) {
                const dto: UpdateWorkOrderStatusDto = {
                    name,
                    color,
                    sortOrder,
                    isInitial,
                    isFinal,
                    isActive,
                };
                await onSave(dto, status.id);
            } else {
                const dto: CreateWorkOrderStatusDto = {
                    code,
                    name,
                    color,
                    sortOrder,
                    isInitial,
                    isFinal,
                    isActive,
                };
                await onSave(dto);
            }
            onClose();
        } catch (error) {
            console.error('Ошибка сохранения статуса:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const isValid = code.trim() && name.trim();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isEditMode ? 'Редактировать статус' : 'Новый статус'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Код"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            size="small"
                            disabled={isEditMode}
                            required
                            placeholder="PENDING"
                            inputProps={{ maxLength: 50 }}
                            sx={{ width: '35%' }}
                        />
                        <TextField
                            label="Название"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            size="small"
                            required
                            placeholder="Ожидание"
                            inputProps={{ maxLength: 100 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Цвет"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: '50%' }}
                        />
                        <TextField
                            label="Порядок сортировки"
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0 }}
                        />
                    </Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isInitial}
                                onChange={(e) => setIsInitial(e.target.checked)}
                            />
                        }
                        label="Начальный статус (назначается автоматически при создании ЗН)"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isFinal}
                                onChange={(e) => setIsFinal(e.target.checked)}
                            />
                        }
                        label="Конечный статус (завершает жизненный цикл ЗН)"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        }
                        label="Активен"
                    />
                </Stack>
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
