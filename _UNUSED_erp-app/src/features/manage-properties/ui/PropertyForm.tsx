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
  Chip,
  Autocomplete,
  Typography
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';
import type { Property, PropertyDataType, CreatePropertyInput, UpdatePropertyInput } from '../model/types';
import { useCreateProperty, useUpdateProperty } from '../model/property.hooks';

interface PropertyFormProps {
  /** Свойство для редактирования (если undefined - режим создания) */
  property?: Property;
  /** Callback успешного сохранения */
  onSuccess: () => void;
  /** Callback отмены */
  onCancel: () => void;
}

const DATA_TYPE_MAP: Record<string, string> = {
  'string': 'string',
  'number': 'number',
  'boolean': 'boolean',
  'select': 'select',
  'multiselect': 'multi_select',
};

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
    possibleValues: [] as string[],
    defaultValue: '',
  });

  // Загрузка данных при редактировании
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        code: property.code || '',
        dataType: property.dataType || 'string',
        isRequired: property.isRequired || false,
        possibleValues: property.possibleValues || [],
        defaultValue: property.defaultValue || '',
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
  };

  const handlePossibleValuesChange = (
    event: React.SyntheticEvent, 
    newValue: string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      possibleValues: newValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const propertyData: any = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        dataType: DATA_TYPE_MAP[formData.dataType],
        isRequired: formData.isRequired,
        displayOrder: 0,
      };

      // Добавляем опциональные поля только если они есть
      if (formData.possibleValues.length > 0) {
        propertyData.possibleValues = formData.possibleValues;
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

  const isSubmitDisabled = !formData.name?.trim() || !formData.code?.trim();

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



      {(formData.dataType === 'select' || formData.dataType === 'multiselect') && (
        <Autocomplete
          multiple
          freeSolo
          options={[]} // Пустой массив, так как пользователь может вводить любые значения
          value={formData.possibleValues}
          onChange={handlePossibleValuesChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip 
                variant="outlined" 
                label={option} 
                {...getTagProps({ index })} 
                key={index}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Возможные значения"
              placeholder="Введите значение и нажмите Enter"
              helperText="Добавьте возможные значения через Enter"
            />
          )}
          sx={{ mt: 2 }}
        />
      )}

      {(formData.dataType === 'select' || formData.dataType === 'multiselect') && (
        <TextField
          fullWidth
          label="Значение по умолчанию"
          value={formData.defaultValue}
          onChange={handleChange('defaultValue')}
          margin="normal"
          helperText="Значение, которое будет установлено по умолчанию"
        />
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