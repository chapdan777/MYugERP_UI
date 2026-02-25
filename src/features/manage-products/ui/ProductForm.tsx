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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { Product, CreateProductInput } from '../model/types';
import { useCreateProduct, useUpdateProduct, useSetProductProperties, useGetProductProperties } from '../model/product.hooks';
import { useProperties } from '../../manage-properties/model/property.hooks';
import { ProductMaterialsDialog } from './ProductMaterialsDialog';
import { ProductComponentsDialog } from './ProductComponentsDialog';

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
    defaultLength: product?.defaultLength ?? undefined,
    defaultWidth: product?.defaultWidth ?? undefined,
    defaultDepth: product?.defaultDepth ?? undefined,
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

  const [materialsDialogOpen, setMaterialsDialogOpen] = useState(false);
  const [componentsDialogOpen, setComponentsDialogOpen] = useState(false);
  const [propertyPickerOpen, setPropertyPickerOpen] = useState(false);

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

      // Only show properties that are actually saved for this product
      // Map productProps to additionalProperties format, enriching with property details
      const mappedProperties = productProps
        .map((productProp: any) => {
          // Find the full property details from the properties list
          const property = properties.find((p: any) => p.id === productProp.propertyId);
          if (!property) return null; // Property no longer exists in system

          return {
            propertyId: property.id,
            property,
            value: productProp.defaultValue ?? property.defaultValue ?? '',
            isActive: productProp.isActive ?? true, // Read isActive from saved data
            defaultValue: productProp.defaultValue ?? property.defaultValue ?? '',
          };
        })
        .filter(Boolean); // Remove nulls

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
        prop.propertyId === propertyId
          ? { ...prop, value, defaultValue: value } // Update both value and defaultValue
          : prop
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

  // Добавление конкретного свойства к продукту
  const addPropertyToProduct = (property: any, asActive: boolean = true) => {
    // Проверяем, не добавлено ли уже это свойство
    const exists = additionalProperties.some(p => p.propertyId === property.id);
    if (exists) return;

    setAdditionalProperties(prev => [
      ...prev,
      {
        propertyId: property.id,
        property,
        value: property.defaultValue || '',
        isActive: asActive,
        defaultValue: property.defaultValue || '',
      }
    ]);
  };

  // Удаление свойства из продукта
  const removePropertyFromProduct = (propertyId: number) => {
    setAdditionalProperties(prev => prev.filter(p => p.propertyId !== propertyId));
  };

  // Получение свойств, которые ещё не добавлены к продукту
  const getAvailableProperties = () => {
    const addedIds = new Set(additionalProperties.map(p => p.propertyId));
    return properties.filter((p: any) =>
      !addedIds.has(p.id) &&
      p.isActive !== false &&
      p.is_active !== false &&
      p.is_active !== 0
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
          defaultLength: formData.defaultLength,
          defaultWidth: formData.defaultWidth,
          defaultDepth: formData.defaultDepth,
        };
        console.log('📤 Update payload:', updateData);
        resultProduct = await updateProduct(product.id.toString(), updateData);

        // Save ALL properties (both active and inactive) to persist deletions and state
        const propertiesToSave = additionalProperties
          .map((p, index) => ({
            propertyId: typeof p.propertyId === 'string'
              ? parseInt(p.propertyId.replace('prop-', ''))
              : p.propertyId,
            isRequired: false,
            displayOrder: index,
            defaultValue: p.defaultValue || null,
            isActive: p.isActive, // Include active state
          }));

        // Always call API to update properties (even if empty - to delete all)
        await setProductProperties(product.id, propertiesToSave);

        setSnackbar({
          open: true,
          message: `Номенклатура "${resultProduct.name}" успешно обновлена!`,
          severity: 'success'
        });
      } else {
        // Режим создания - отправляем все поля
        resultProduct = await createProduct(formData);

        // Save ALL properties (both active and inactive) to persist state
        const propertiesToSave = additionalProperties
          .map((p, index) => ({
            propertyId: typeof p.propertyId === 'string'
              ? parseInt(p.propertyId.replace('prop-', ''))
              : p.propertyId,
            isRequired: false,
            displayOrder: index,
            defaultValue: p.defaultValue || null,
            isActive: p.isActive,
          }));

        if (propertiesToSave.length > 0) {
          await setProductProperties(resultProduct.id, propertiesToSave);
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
    { value: 'material', label: 'Материал' },
    { value: 'semifinished', label: 'Полуфабрикат' },
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

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Размеры по умолчанию (опционально)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Длина (мм)"
                type="number"
                value={formData.defaultLength ?? ''}
                onChange={e => handleFieldChange('defaultLength', e.target.value === '' ? undefined : Number(e.target.value))}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />

              <TextField
                sx={{ flex: 1 }}
                label="Ширина (мм)"
                type="number"
                value={formData.defaultWidth ?? ''}
                onChange={e => handleFieldChange('defaultWidth', e.target.value === '' ? undefined : Number(e.target.value))}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />

              <TextField
                sx={{ flex: 1 }}
                label="Толщина / Глубина (мм)"
                type="number"
                value={formData.defaultDepth ?? ''}
                onChange={e => handleFieldChange('defaultDepth', e.target.value === '' ? undefined : Number(e.target.value))}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Box>

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
                  <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setPropertyPickerOpen(true)}
                    >
                      Добавить дополнительные свойства
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => setMaterialsDialogOpen(true)}
                    >
                      Управление материалами (Формулы)
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
                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={property.dataType}
                                size="small"
                                variant="outlined"
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removePropertyFromProduct(property.id)}
                                title="Удалить свойство"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
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
                disabled={!formData.name || !formData.category || !formData.unit || formData.basePrice < 0}
              >
                {product ? 'Сохранить' : 'Создать'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <ProductMaterialsDialog
        open={materialsDialogOpen}
        onClose={() => setMaterialsDialogOpen(false)}
        productId={product ? product.id : 0}
        productName={product?.name || 'Новый продукт'}
        properties={additionalProperties.filter(p => p.isActive)}
      />

      {product && (
        <ProductComponentsDialog
          open={componentsDialogOpen}
          onClose={() => setComponentsDialogOpen(false)}
          productId={product.id}
          productName={product.name}
          properties={additionalProperties.filter(p => p.isActive)}
        />
      )}

      {/* Property Picker Dialog */}
      <Dialog
        open={propertyPickerOpen}
        onClose={() => setPropertyPickerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Добавить дополнительное свойство</DialogTitle>
        <DialogContent>
          {getAvailableProperties().length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Все доступные свойства уже добавлены к этому продукту
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
              {getAvailableProperties().map((property: any) => (
                <Card key={property.id} variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1">{property.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {property.code} • {property.dataType}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            addPropertyToProduct(property, true);
                            setPropertyPickerOpen(false);
                          }}
                        >
                          Добавить (активное)
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            addPropertyToProduct(property, false);
                            setPropertyPickerOpen(false);
                          }}
                        >
                          Добавить (неактивное)
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropertyPickerOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

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