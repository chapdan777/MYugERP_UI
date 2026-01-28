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
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import type { PropertyHeader } from '../model/types';
import {
  useGetHeaderItems,
  useAddItemToHeader,
  useRemoveItemFromHeader
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

  // Хук для добавления элементов
  const { addItemToHeader } = useAddItemToHeader();

  // Хук для удаления элементов
  const { removeItemFromHeader } = useRemoveItemFromHeader();

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
          <Alert severity="error" sx={{ mb: 2 }}>
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
          ) : headerItems.length === 0 ? (
            <Typography color="text.secondary">
              В этой шапке пока нет элементов
            </Typography>
          ) : (
            <List>
              {headerItems.map((item, index) => (
                <ListItem
                  key={`${item.headerId}-${item.propertyId}-${index}`}
                  divider
                >
                  <ListItemText
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
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveItem(item.propertyId)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
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