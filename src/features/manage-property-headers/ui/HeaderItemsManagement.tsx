/**
 * @file Управление элементами шапки свойств
 * @description Компонент для добавления и управления свойствами в шапке
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

import type { PropertyHeader } from '../model/types';
import {
  useGetHeaderItems,
  useAddItemToHeader,
  useRemoveItemFromHeader,
  useUpdateItemInHeader,
} from '../model/hooks';
import { useProperties } from '../../manage-properties/model/property.hooks';

interface HeaderItemsManagementProps {
  header: PropertyHeader;
  open: boolean;
  onClose: () => void;
}

const HeaderItemsManagement: React.FC<HeaderItemsManagementProps> = ({
  header,
  open,
  onClose,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);

  // Получаем элементы текущей шапки
  const { headerItems, isLoading: itemsLoading } = useGetHeaderItems(header.id);

  // Получаем доступные свойства
  const { properties, isLoading: propertiesLoading } = useProperties();

  // Хуки для операций
  const { addItemToHeader } = useAddItemToHeader();
  const { removeItemFromHeader } = useRemoveItemFromHeader();
  const { updateItemInHeader } = useUpdateItemInHeader();

  // Сортированный список элементов
  const sortedItems = [...headerItems].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );

  // Сброс формы при закрытии
  useEffect(() => {
    if (!open) {
      setSelectedPropertyId('');
      setSortOrder('0');
      setError(null);
    }
  }, [open]);

  const handleAddItem = async () => {
    if (!selectedPropertyId) {
      setError('Выберите свойство');
      return;
    }

    try {
      await addItemToHeader(header.id, {
        propertyId: Number(selectedPropertyId),
        sortOrder: Number(sortOrder) || 0,
      });

      // Сбрасываем форму
      setSelectedPropertyId('');
      setSortOrder(String((Number(sortOrder) || 0) + 10)); // Increment for convenience
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при добавлении элемента');
    }
  };

  const handleRemoveItem = async (propertyId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это свойство из шапки?')) {
      try {
        await removeItemFromHeader(header.id, propertyId);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при удалении элемента');
      }
    }
  };

  /**
   * Перемещение элемента вверх/вниз — пересчитываем порядки для всех элементов (10, 20, 30...)
   */
  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return;

    // Создаем новый массив с нужным порядком
    const newItems = [...sortedItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    try {
      // Присваиваем строгую последовательность значений 0, 10, 20...
      for (let i = 0; i < newItems.length; i++) {
        const expectedSort = i * 10;
        if (newItems[i].sortOrder !== expectedSort) {
          await updateItemInHeader(header.id, newItems[i].propertyId, {
            sortOrder: expectedSort,
          });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при изменении порядка');
    }
  };

  // Получаем имя свойства по ID
  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property ? property.name : `Свойство ${propertyId}`;
  };

  const isLoading = itemsLoading || propertiesLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Управление элементами шапки "{header.name}"
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Форма добавления элемента */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Добавить свойство в шапку
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel>Свойство *</InputLabel>
              <Select
                value={selectedPropertyId}
                label="Свойство *"
                onChange={(e) => setSelectedPropertyId(e.target.value as number)}
                disabled={isLoading}
              >
                {properties
                  .filter((p: any) => p.isActive !== false && p.is_active !== false && p.is_active !== 0)
                  .map((property: any) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label="Сортировка"
              type="number"
              value={sortOrder}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSortOrder(e.target.value)}
              disabled={isLoading}
              sx={{ width: 100 }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={isLoading || !selectedPropertyId}
            >
              Добавить
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Список элементов шапки */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Элементы шапки ({headerItems.length})
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : sortedItems.length === 0 ? (
            <Typography color="text.secondary">
              В этой шапке пока нет элементов
            </Typography>
          ) : (
            <List>
              {sortedItems.map((item, index) => (
                <ListItem
                  key={`${item.headerId}-${item.propertyId}-${index}`}
                  divider
                  sx={{
                    pr: 16,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {/* Иконка-индикатор порядка */}
                  <DragIcon
                    sx={{
                      mr: 1.5,
                      color: 'text.disabled',
                      fontSize: 20,
                    }}
                  />

                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Chip
                        label={getPropertyName(item.propertyId)}
                        size="small"
                        color="primary"
                      />
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Typography variant="caption" color="text.secondary">
                          Сортировка: {item.sortOrder || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Добавлено: {new Date(item.createdAt).toLocaleString('ru-RU')}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Tooltip title="Переместить вверх">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveItem(index, 'up')}
                            disabled={index === 0}
                            sx={{
                              color: index === 0 ? 'text.disabled' : 'primary.main',
                            }}
                          >
                            <ArrowUpIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Переместить вниз">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveItem(index, 'down')}
                            disabled={index === sortedItems.length - 1}
                            sx={{
                              color: index === sortedItems.length - 1 ? 'text.disabled' : 'primary.main',
                            }}
                          >
                            <ArrowDownIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Удалить из шапки">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveItem(item.propertyId)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HeaderItemsManagement;