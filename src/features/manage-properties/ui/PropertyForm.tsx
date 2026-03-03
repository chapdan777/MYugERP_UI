import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import type { Property, PropertyDataType } from '../model/types';
import { useCreateProperty, useUpdateProperty } from '../model/property.hooks';
import { PropertyValueList } from './PropertyValueList';

interface PropertyFormProps {
  /** Свойство для редактирования (если undefined - режим создания) */
  property?: Property;
  /** Callback успешного сохранения */
  onSuccess: () => void;
  /** Callback отмены */
  onCancel: () => void;
}

const DATA_TYPES: { value: PropertyDataType; label: string }[] = [
  { value: 'string', label: 'Строка' },
  { value: 'number', label: 'Число' },
  { value: 'boolean', label: 'Логическое значение' },
  { value: 'select', label: 'Выбор из списка' },
  { value: 'multiselect', label: 'Множественный выбор' },
];

export const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSuccess,
  onCancel
}) => {
  const { createProperty } = useCreateProperty();
  const { updateProperty } = useUpdateProperty();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    dataType: 'string' as PropertyDataType,
    isRequired: false,
    defaultValue: '',
    variableName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загрузка данных при редактировании
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        code: property.code || '',
        dataType: property.dataType || 'string',
        isRequired: property.isRequired || false,
        defaultValue: property.defaultValue || '',
        variableName: property.variableName || '',
      });
    }
  }, [property]);

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.type === 'checkbox'
      ? (event.target as HTMLInputElement).checked
      : event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'variableName') {
      const stringValue = String(value);
      if (stringValue && !/^[a-zA-Z0-9_]*$/.test(stringValue)) {
        setErrors(prev => ({ ...prev, variableName: 'Допустимы только латинские буквы, цифры и подчеркивание' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.variableName;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const propertyData: any = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        isRequired: formData.isRequired,
        displayOrder: 0,
      };

      // Тип данных можно задать только при создании
      if (!property) {
        propertyData.dataType = formData.dataType;
      }

      if (formData.variableName?.trim()) {
        propertyData.variableName = formData.variableName.trim();
      }

      if (formData.defaultValue.trim()) {
        propertyData.defaultValue = formData.defaultValue.trim();
      }

      console.log('Отправляемые данные:', propertyData);

      if (property) {
        // Режим редактирования
        await updateProperty(property.id, propertyData);
      } else {
        // Режим создания
        await createProperty(propertyData);
      }

      onSuccess();
    } catch (error) {
      console.error('Ошибка при сохранении свойства:', error);
    }
  };



  const isSubmitDisabled = !formData.name?.trim() || !formData.code?.trim() || !!errors.variableName;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Название свойства *"
        value={formData.name}
        onChange={handleChange('name')}
        margin="normal"
        required
        helperText="Отображаемое имя свойства"
      />

      <TextField
        fullWidth
        label="Код свойства *"
        value={formData.code}
        onChange={handleChange('code')}
        margin="normal"
        required
        helperText="Уникальный технический код"
      />

      <TextField
        fullWidth
        label="Имя переменной (для формул)"
        value={formData.variableName}
        onChange={handleChange('variableName')}
        margin="normal"
        error={!!errors.variableName}
        helperText={errors.variableName || "Имя переменной для использования в формулах (латиница, цифры, _)"}
        inputProps={{ style: { textTransform: 'uppercase' } }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Тип данных *</InputLabel>
        <Select
          value={formData.dataType}
          label="Тип данных *"
          onChange={(e) => handleChange('dataType')({
            target: { value: e.target.value, type: 'select' }
          } as any)}
        >
          {DATA_TYPES.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {(formData.dataType === 'select' || formData.dataType === 'multiselect' || formData.dataType === 'boolean') && (
        <React.Fragment>
          {property ? (
            <PropertyValueList propertyId={property.id} />
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Сохраните свойство, чтобы добавить возможные значения и наценки
            </Alert>
          )}

          {formData.dataType !== 'boolean' && (
            <TextField
              fullWidth
              label="Значение по умолчанию"
              value={formData.defaultValue}
              onChange={handleChange('defaultValue')}
              margin="normal"
              helperText="Значение, которое будет установлено по умолчанию"
              sx={{ mt: 2 }}
            />
          )}
        </React.Fragment>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isRequired}
              onChange={handleChange('isRequired')}
            />
          }
          label="Обязательное поле"
        />

      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitDisabled}
          startIcon={<SaveIcon />}
        >
          {property ? 'Сохранить изменения' : 'Создать свойство'}
        </Button>

        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
        >
          Отмена
        </Button>
      </Box>
    </Box>
  );
};