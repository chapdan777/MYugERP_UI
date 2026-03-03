import React, { useState } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Button,
    Paper,
    CircularProgress
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { usePropertyValues, useCreatePropertyValue, useUpdatePropertyValue, useDeletePropertyValue } from '../model/property-value.hooks';
import type { PropertyValue } from '../../../shared/api/property/types';

interface PropertyValueListProps {
    propertyId: number;
}

export const PropertyValueList: React.FC<PropertyValueListProps> = ({ propertyId }) => {
    const { propertyValues, isLoading } = usePropertyValues(propertyId);
    const { createPropertyValue } = useCreatePropertyValue();
    const { updatePropertyValue } = useUpdatePropertyValue();
    const { deletePropertyValue } = useDeletePropertyValue();

    // Состояние для добавления нового значения
    const [newValue, setNewValue] = useState('');
    const [newMarkup, setNewMarkup] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    // Состояние для редактирования
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editMarkup, setEditMarkup] = useState<string>('');

    const handleAdd = async () => {
        if (!newValue.trim()) return;

        try {
            await createPropertyValue({
                propertyId,
                value: newValue.trim(),
                priceModifierValue: newMarkup || undefined,
                priceModifierId: null,
                displayOrder: propertyValues.length // В конец списка
            });
            setNewValue('');
            setNewMarkup('');
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to add value', error);
        }
    };

    const handleStartEdit = (item: PropertyValue) => {
        setEditingId(item.id);
        setEditValue(item.value);
        if (item.priceModifier) {
            // Пытаемся восстановить строку из имени (оно сохраняется как "Auto: +1000")
            setEditMarkup(item.priceModifier.name.replace('Auto: ', ''));
        } else {
            setEditMarkup('');
        }
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editValue.trim()) return;

        try {
            if (editingId < 0) {
                // Если ID отрицательный - это виртуальное значение (Да/Нет или из JSON),
                // создаем новую запись в БД вместо обновления
                await createPropertyValue({
                    propertyId,
                    value: editValue.trim(),
                    priceModifierValue: editMarkup || undefined,
                    priceModifierId: null,
                    displayOrder: propertyValues.length
                });
            } else {
                await updatePropertyValue(editingId, propertyId, {
                    value: editValue.trim(),
                    priceModifierValue: editMarkup || undefined,
                    priceModifierId: null
                });
            }
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update value', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить это значение?')) {
            try {
                await deletePropertyValue(id, propertyId);
            } catch (error) {
                console.error('Failed to delete value', error);
            }
        }
    };

    if (isLoading) {
        return <CircularProgress size={24} sx={{ mt: 2 }} />;
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Возможные значения и наценки
            </Typography>

            <List dense>
                {propertyValues.map((item) => (
                    <ListItem key={item.id} divider>
                        {editingId === item.id ? (
                            <Box sx={{ display: 'flex', width: '100%', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    size="small"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="Значение"
                                    fullWidth
                                />
                                <TextField
                                    size="small"
                                    type="text"
                                    value={editMarkup}
                                    onChange={(e) => setEditMarkup(e.target.value)}
                                    placeholder="Наценка"
                                    // InputProps={{
                                    //     endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                                    // }}
                                    sx={{ width: 150 }}
                                />
                                <IconButton onClick={handleSaveEdit} color="primary" size="small">
                                    <SaveIcon />
                                </IconButton>
                                <IconButton onClick={() => setEditingId(null)} size="small">
                                    <CancelIcon />
                                </IconButton>
                            </Box>
                        ) : (
                            <>
                                <ListItemText
                                    primary={item.value}
                                    secondary={item.priceModifier ? `Наценка: ${item.priceModifier.name.replace('Auto: ', '')}` : (item.priceModifierId ? `Наценка: ${item.priceModifierId} (ID)` : 'Без наценки')}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleStartEdit(item)} size="small" sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDelete(item.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>

            {isAdding ? (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Новое значение"
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        size="small"
                        type="text"
                        value={newMarkup}
                        onChange={(e) => setNewMarkup(e.target.value)}
                        placeholder="Наценка"
                        // InputProps={{
                        //     endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                        // }}
                        sx={{ width: 150 }}
                    />
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAdd}
                        disabled={!newValue.trim()}
                        startIcon={<SaveIcon />}
                    >
                        Сохранить
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setIsAdding(false)}
                    >
                        Отмена
                    </Button>
                </Box>
            ) : (
                <Button
                    startIcon={<AddIcon />}
                    onClick={() => setIsAdding(true)}
                    sx={{ mt: 1 }}
                    size="small"
                >
                    Добавить значение
                </Button>
            )}
        </Paper>
    );
};
