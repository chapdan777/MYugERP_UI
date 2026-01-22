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
  TextField,
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
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import type { PropertyHeader, PropertyHeaderItem } from '../model/types';
import { 
  useGetHeaderItems, 
  useAddItemToHeader
} from '../model/hooks';
import { useProperties } from '../../property-management/model/property.hooks';

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
  const [itemValue, setItemValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Получаем элементы текущей шапки
  const { headerItems, isLoading: itemsLoading } = useGetHeaderItems(header.id);
  
  // Получаем доступные свойства
  const { properties, isLoading: propertiesLoading } = useProperties();
  
  // Хук для добавления элементов
  const { addItemToHeader } = useAddItemToHeader();

  // Сброс формы при закрытии
  useEffect(() => {
    if (!open) {
      setSelectedPropertyId('');
      setItemValue('');
      setError(null);
    }
  }, [open]);

  const handleAddItem = async () => {
    if (!selectedPropertyId || !itemValue.trim()) {
      setError('Выберите свойство и введите значение');
      return;
    }

    try {
      await addItemToHeader(header.id, {
        propertyId: Number(selectedPropertyId),
        value: itemValue.trim(),
      });
      
      // Сбрасываем форму
      setSelectedPropertyId('');
      setItemValue('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при добавлении элемента');
    }
  };

  const handleRemoveItem = (itemId: number) => {
    // TODO: Реализовать удаление элемента из шапки
    alert(`Функция удаления элемента ${itemId} будет реализована позже`);
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
            <FormControl fullWidth>
              <InputLabel>Свойство *</InputLabel>
              <Select
                value={selectedPropertyId}
                label="Свойство *"
                onChange={(e) => setSelectedPropertyId(e.target.value as number)}
                disabled={isLoading}
              >
                {properties.map((property: any) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Значение *"
              value={itemValue}
              onChange={(e) => setItemValue(e.target.value)}
              disabled={isLoading}
              sx={{ flex: 1 }}
            />
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={isLoading || !selectedPropertyId || !itemValue.trim()}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={getPropertyName(item.propertyId)} 
                          size="small" 
                          color="primary" 
                        />
                        <Typography>{item.value}</Typography>
                      </Box>
                    }
                    secondary={`Добавлено: ${new Date(item.createdAt).toLocaleString('ru-RU')}`}
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