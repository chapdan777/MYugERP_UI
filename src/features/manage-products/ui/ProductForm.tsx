/**
 * @file Форма добавления/редактирования номенклатуры
 * @description Компонент для создания и редактирования продуктов с дополнительными свойствами
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
} from '@mui/material';
import type { Product, CreateProductInput } from '../model/types';
import { useCreateProduct, useUpdateProduct, useSetProductProperties, useGetProductProperties } from '../model/product.hooks';
import { useProperties } from '../../manage-properties/model/property.hooks';

interface ProductFormProps {
  /** Продукт для редактирования (если undefined - создание нового) */
  product?: Product;
  /** Callback успешного сохранения */
  onSuccess: (product: Product) => void;
  /** Callback отмены */
  onCancel: () => void;
}

/**
 * Форма добавления/редактирования номенклатуры
 */
export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const { createProduct } = useCreateProduct();
  const { updateProduct } = useUpdateProduct();
  const { setProductProperties } = useSetProductProperties();
  const { getProductProperties } = useGetProductProperties();
  const { properties, isLoading: propertiesLoading, isError, error } = useProperties();

  // Отладочный вывод
  console.log('Properties hook result:', { properties, propertiesLoading, isError, error });
  const [formData, setFormData] = useState<CreateProductInput>({
    name: product?.name || '',
    code: product?.code || '',
    description: product?.description || '',
    basePrice: product?.basePrice || 0,
    unit: product?.unit || 'шт',
    category: product?.category || '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [additionalProperties, setAdditionalProperties] = useState<
    Array<{
      propertyId: string | number;
      property: any;
      value: string;
      isActive: boolean;
      defaultValue?: string;
    }>
  >([]);

  // Загрузка дополнительных свойств при монтировании
  useEffect(() => {
    // При редактировании загружаем существующие свойства продукта
    if (product && properties.length > 0) {
      loadProductProperties();
    }
    // При создании не загружаем свойства - пользователь сам их добавит при необходимости
    else if (!product && properties.length > 0) {
      setAdditionalProperties([]); // Пустой массив при создании
    }
  }, [properties, product]);

  // Загрузка свойств продукта
  const loadProductProperties = async () => {
    if (!product) return;

    try {
      const productProps = await getProductProperties(product.id);
      console.log('📥 Loaded product properties:', productProps);

      // Преобразуем свойства продукта в формат additionalProperties
      const mappedProperties = properties
        .filter((p: any) => p.isActive !== false && p.is_active !== false && p.is_active !== 0)
        .map((property: any) => {
          const productProp = productProps.find((pp: any) => pp.propertyId === property.id);

          return {
            propertyId: property.id,
            property,
            value: property.defaultValue || '',
            isActive: !!productProp, // Активно если есть в product_properties
            defaultValue: property.defaultValue || '',
          };
        });

      setAdditionalProperties(mappedProperties);
    } catch (error) {
      console.error('Ошибка при загрузке свойств продукта:', error);
      // Если ошибка - загружаем все свойства как неактивные
      const initialProperties = properties
        .filter((p: any) => p.isActive !== false && p.is_active !== false && p.is_active !== 0)
        .map((property: any) => ({
          propertyId: property.id,
          property,
          value: property.defaultValue || '',
          isActive: false,
          defaultValue: property.defaultValue || '',
        }));
      setAdditionalProperties(initialProperties);
    }
  };

  // Обновление значений дополнительных свойств
  const handlePropertyChange = (propertyId: number, value: string) => {
    setAdditionalProperties(prev =>
      prev.map(prop =>
        prop.propertyId === propertyId ? { ...prop, value } : prop
      )
    );
  };

  // Переключение активности свойства
  const togglePropertyActive = (propertyId: number) => {
    setAdditionalProperties(prev =>
      prev.map(prop =>
        prop.propertyId === propertyId
          ? { ...prop, isActive: !prop.isActive }
          : prop
      )
    );
  };

  // Обработка изменения основных полей формы
  const handleFieldChange = (field: keyof CreateProductInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Сохранение формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log(`${product ? 'Обновление' : 'Создание'} продукта:`, formData);

      let resultProduct;

      if (product) {
        // Режим редактирования - отправляем только разрешенные поля
        const updateData = {
          name: formData.name,
          description: formData.description,
          basePrice: formData.basePrice,
          unit: formData.unit,
          category: formData.category,
        };
        console.log('📤 Update payload:', updateData);
        resultProduct = await updateProduct(product.id.toString(), updateData);

        // Сохраняем свойства (только активные)
        const activeProperties = additionalProperties
          .filter(p => p.isActive)
          .map((p, index) => ({
            propertyId: typeof p.propertyId === 'string'
              ? parseInt(p.propertyId.replace('prop-', ''))
              : p.propertyId,
            isRequired: false,
            displayOrder: index,
          }));

        if (activeProperties.length > 0) {
          await setProductProperties(product.id, activeProperties);
        }

        setSnackbar({
          open: true,
          message: `Номенклатура "${resultProduct.name}" успешно обновлена!`,
          severity: 'success'
        });
      } else {
        // Режим создания - отправляем все поля
        resultProduct = await createProduct(formData);

        // Сохраняем свойства (только активные)
        const activeProperties = additionalProperties
          .filter(p => p.isActive)
          .map((p, index) => ({
            propertyId: typeof p.propertyId === 'string'
              ? parseInt(p.propertyId.replace('prop-', ''))
              : p.propertyId,
            isRequired: false,
            displayOrder: index,
          }));

        if (activeProperties.length > 0) {
          await setProductProperties(resultProduct.id, activeProperties);
        }

        setSnackbar({
          open: true,
          message: `Номенклатура "${resultProduct.name}" успешно создана!`,
          severity: 'success'
        });
      }

      onSuccess(resultProduct);
    } catch (error: any) {
      console.error(`${product ? 'Ошибка при обновлении' : 'Ошибка при создании'} продукта:`, error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `${product ? 'Ошибка при обновлении' : 'Ошибка при создании'} номенклатуры`,
        severity: 'error'
      });
    }
  };

  // Категории продукта (соответствуют ProductCategory enum)
  const categories = [
    { value: 'windows', label: 'Окна' },
    { value: 'doors', label: 'Двери' },
    { value: 'facades', label: 'Фасады' },
    { value: 'partitions', label: 'Перегородки' },
    { value: 'railings', label: 'Ограждения' },
    { value: 'canopies', label: 'Навесы' },
    { value: 'other', label: 'Другое' },
  ];

  // Единицы измерения
  const unitsOfMeasure = [
    { value: 'шт', label: 'шт' },
    { value: 'м2', label: 'м²' },
    { value: 'пог_метр', label: 'пог.м' },
    { value: 'комплект', label: 'комплект' },
  ];

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {product ? 'Редактировать номенклатуру' : 'Добавить новую номенклатуру'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Основная информация */}
            <Typography variant="subtitle1" gutterBottom>
              Основная информация
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Наименование *"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                required
              />

              <TextField
                sx={{ flex: 1 }}
                label="Артикул"
                value={formData.code}
                onChange={e => handleFieldChange('code', e.target.value)}
              />
            </Box>

            <TextField
              fullWidth
              label="Описание"
              multiline
              rows={3}
              value={formData.description}
              onChange={e => handleFieldChange('description', e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Категория *</InputLabel>
                <Select
                  value={formData.category}
                  label="Категория *"
                  onChange={e => handleFieldChange('category', e.target.value)}
                  required
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Ед. изм *</InputLabel>
                <Select
                  value={formData.unit}
                  label="Ед. изм *"
                  onChange={e => handleFieldChange('unit', e.target.value)}
                  required
                >
                  {unitsOfMeasure.map(unit => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                sx={{ flex: 1 }}
                label="Базовая цена *"
                type="number"
                value={formData.basePrice}
                onChange={e => handleFieldChange('basePrice', Number(e.target.value))}
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Box>

            {/* Размеры по умолчанию - временно скрыты, так как требуют отдельной реализации */}
            {/*
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Размеры по умолчанию
            </Typography>
              
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Длина (мм)"
                type="number"
                value={formData.properties?.defaultLength || ''}
                onChange={e => handleFieldChange('properties', {
                  ...formData.properties,
                  defaultLength: Number(e.target.value)
                })}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
                
              <TextField
                sx={{ flex: 1 }}
                label="Ширина (мм)"
                type="number"
                value={formData.properties?.defaultWidth || ''}
                onChange={e => handleFieldChange('properties', {
                  ...formData.properties,
                  defaultWidth: Number(e.target.value)
                })}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
                
              <TextField
                sx={{ flex: 1 }}
                label="Глубина (мм)"
                type="number"
                value={formData.properties?.defaultDepth || ''}
                onChange={e => handleFieldChange('properties', {
                  ...formData.properties,
                  defaultDepth: Number(e.target.value)
                })}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Box>
            */}

            {/* Дополнительные свойства */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
              Дополнительные свойства
            </Typography>

            {propertiesLoading ? (
              <Typography>Загрузка свойств...</Typography>
            ) : (
              <>
                {/* Кнопка добавления свойств - всегда видна при редактировании */}
                {product && (
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // Добавляем все доступные свойства как неактивные
                        const newProperties = properties
                          .filter((p: any) => p.isActive !== false && p.is_active !== false && p.is_active !== 0)
                          .map((property: any) => ({
                            propertyId: property.id,
                            property,
                            value: property.defaultValue || '',
                            isActive: false,
                            defaultValue: property.defaultValue || '',
                          }));
                        setAdditionalProperties(prev => [...prev, ...newProperties]);
                      }}
                    >
                      Добавить дополнительные свойства
                    </Button>
                  </Box>
                )}

                {/* Список свойств */}
                {additionalProperties.length === 0 ? (
                  <Typography color="text.secondary">
                    {product
                      ? 'У этого продукта пока нет дополнительных свойств'
                      : 'Дополнительные свойства не добавлены'}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {additionalProperties.map(({ property, value, isActive, defaultValue }) => (
                      <Card key={property.id} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isActive}
                                  onChange={() => togglePropertyActive(property.id)}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="subtitle2">
                                    {property.name}
                                  </Typography>
                                  {property.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {property.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            <Box sx={{ ml: 'auto' }}>
                              <Chip
                                label={property.dataType}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>

                          {isActive && (
                            <>
                              {/* Разные поля ввода в зависимости от типа свойства */}
                              {property.dataType === 'select' && property.possibleValues ? (
                                <FormControl fullWidth size="small">
                                  <InputLabel>Значение по умолчанию</InputLabel>
                                  <Select
                                    value={value}
                                    label="Значение по умолчанию"
                                    onChange={e => handlePropertyChange(property.id, e.target.value)}
                                  >
                                    {property.possibleValues.map((option: string) => (
                                      <MenuItem key={option} value={option}>
                                        {option}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : property.dataType === 'boolean' ? (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={String(value).toLowerCase() === 'true'}
                                      onChange={e => handlePropertyChange(property.id, e.target.checked.toString())}
                                    />
                                  }
                                  label="Активно"
                                />
                              ) : (
                                <TextField
                                  fullWidth
                                  label={`Значение по умолчанию${defaultValue ? `: ${defaultValue}` : ''}`}
                                  value={value}
                                  onChange={e => handlePropertyChange(property.id, e.target.value)}
                                  size="small"
                                  helperText={`Тип: ${property.dataType}${property.isRequired ? ' (обязательное)' : ''}`}
                                />
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </>
            )}

            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={!formData.name || !formData.category || !formData.unit || formData.basePrice <= 0}
              >
                {product ? 'Сохранить' : 'Создать'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};