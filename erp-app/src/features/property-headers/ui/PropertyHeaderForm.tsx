/**
 * @file Форма шапки свойств
 * @description Компонент формы для создания и редактирования шапок свойств
 */

import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

import type { PropertyHeader, CreatePropertyHeaderInput, UpdatePropertyHeaderInput, PropertyHeaderItem } from '../model/types';
import { useGetHeaderItems } from '../model/hooks';

interface PropertyHeaderFormProps {
  header?: PropertyHeader;
  onSubmit: (data: CreatePropertyHeaderInput | UpdatePropertyHeaderInput) => void;
  onCancel: () => void;
  onAddItem?: (header: PropertyHeader) => void;
  onRemoveItem?: (headerId: number, propertyId: number) => void;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}

const PropertyHeaderForm: React.FC<PropertyHeaderFormProps> = ({
  header,
  onSubmit,
  onCancel,
  onAddItem,
  onRemoveItem,
  loading = false,
  error = null,
  success = false,
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    orderTypeId: 1,
    description: '',
  });

  const isEditMode = !!header;
  
  // Получаем элементы шапки, если в режиме редактирования
  const { headerItems = [], isLoading: itemsLoading } = useGetHeaderItems(header?.id || 0);

  // Заполняем форму при редактировании
  useEffect(() => {
    if (header) {
      setFormData({
        name: header.name,
        orderTypeId: header.orderTypeId,
        description: header.description || '',
      });
    }
  }, [header]);

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      orderTypeId: formData.orderTypeId,
      description: formData.description.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      orderTypeId: 1,
      description: '',
    });
    onCancel();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? 'Редактировать шапку' : 'Создать новую шапку'}
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {isEditMode ? 'Шапка успешно обновлена!' : 'Шапка успешно создана!'}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Название шапки *"
        value={formData.name}
        onChange={handleChange('name')}
        margin="normal"
        required
        helperText="Уникальное название шаблона"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Тип заказа *</InputLabel>
        <Select
          value={formData.orderTypeId}
          label="Тип заказа *"
          onChange={(e) => setFormData(prev => ({
            ...prev,
            orderTypeId: Number(e.target.value),
          }))}
        >
          <MenuItem value={1}>Тип 1 - Стандартные заказы</MenuItem>
          <MenuItem value={2}>Тип 2 - Специальные заказы</MenuItem>
          <MenuItem value={3}>Тип 3 - Производственные заявки</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Описание"
        value={formData.description}
        onChange={handleChange('description')}
        margin="normal"
        multiline
        rows={3}
        helperText="Необязательное описание шапки"
      />

      {isEditMode && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Свойства шапки ({headerItems.length})
            </Typography>
            {onAddItem && header?.id ? (
              <Button 
                variant="contained" 
                size="small"
                onClick={() => onAddItem(header)}
                sx={{ minWidth: 150 }}
              >
                Добавить свойство
              </Button>
            ) : (
              <Typography color="text.secondary" variant="body2">
                {!onAddItem && 'Функция добавления отсутствует'}
                {!header?.id && 'Шапка не выбрана'}
              </Typography>
            )}
          </Box>
          
          {itemsLoading ? (
            <Typography color="text.secondary">Загрузка свойств...</Typography>
          ) : headerItems.length === 0 ? (
            <Typography color="text.secondary">
              В этой шапке пока нет свойств
            </Typography>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {headerItems.map((item: PropertyHeaderItem) => (
                <ListItem
                  key={`${item.headerId}-${item.propertyId}`}
                  divider
                  secondaryAction={
                    onRemoveItem && (
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => onRemoveItem(item.headerId, item.propertyId)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={`Свойство #${item.propertyId}`}
                    secondary={`Значение: ${item.value}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !formData.name.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Сохранение...' : (isEditMode ? 'Обновить' : 'Создать')}
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={loading}
        >
          Отмена
        </Button>
      </Box>
    </Box>
  );
};

export default PropertyHeaderForm;