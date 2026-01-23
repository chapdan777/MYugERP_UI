/**
 * Форма основных данных заказа (шапка)
 */
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { GlassCard } from '@shared/ui';
import type { OrderFormData } from '@entities/order';

interface OrderHeaderFormProps {
  /** Начальные значения формы */
  initialData?: Partial<OrderFormData>;
  /** Колбэк при изменении данных */
  onChange?: (data: OrderFormData) => void;
}

const documentTypes = ['Фасады', 'Двери', 'Кухни', 'Мебель'];

/**
 * Форма с основными данными заказа
 */
export const OrderHeaderForm = ({ initialData, onChange }: OrderHeaderFormProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    documentType: initialData?.documentType || 'Фасады',
    clientName: initialData?.clientName || 'Абдрахманов Саул',
    orderName: initialData?.orderName || 'Диванный Конструктор 2,013',
    orderDate: initialData?.orderDate || '16.02.2017',
    launchDate: initialData?.launchDate || '17.02.2017',
    deadline: initialData?.deadline || 'Неделя',
    lineNumber: initialData?.lineNumber || '#12345',
    manager: initialData?.manager || 'Да версия',
  });

  const handleChange = (field: keyof OrderFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  return (
    <GlassCard sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Первая строка */}
        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Тип документа"
            value={formData.documentType}
            onChange={(e) => handleChange('documentType', e.target.value)}
          >
            {documentTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Клиент"
            value={formData.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Заказ"
            value={formData.orderName}
            onChange={(e) => handleChange('orderName', e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Дата оформления"
            value={formData.orderDate}
            onChange={(e) => handleChange('orderDate', e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Дата запуска"
            value={formData.launchDate}
            onChange={(e) => handleChange('launchDate', e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Срок"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Строка
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formData.lineNumber}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </GlassCard>
  );
};
