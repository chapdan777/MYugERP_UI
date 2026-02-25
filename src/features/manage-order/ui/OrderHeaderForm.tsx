/**
 * Форма основных данных заказа (шапка)
 */
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { GlassCard } from '@shared/ui';
import type { OrderFormData } from '@entities/order';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../manage-users/model/user.hooks';

interface OrderHeaderFormProps {
  /** Начальные значения формы */
  initialData?: Partial<OrderFormData>;
  /** Колбэк при изменении данных */
  onChange?: (data: OrderFormData) => void;
}

const documentTypes = ['Фасады', 'Двери', 'Кухни', 'Мебель'];
const deadlineOptions = [
  '7 дней (календарных)',
  '14 дней (календарных)',
  '35 дней (календарных)',
  '45 рабочих дней'
];

/**
 * Форма с основными данными заказа
 */
export const OrderHeaderForm = ({ initialData, onChange }: OrderHeaderFormProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    documentType: initialData?.documentType || 'Фасады',
    clientName: initialData?.clientName || '',
    orderName: initialData?.orderName || '',
    orderDate: initialData?.orderDate || new Date().toLocaleDateString('ru-RU'),
    launchDate: initialData?.launchDate || new Date().toLocaleDateString('ru-RU'),
    deadline: initialData?.deadline || '',
    lineNumber: initialData?.lineNumber || '',
    manager: initialData?.manager || '',
  });

  const navigate = useNavigate();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const clients = users?.filter(u => u.role === 'CLIENT') || [];

  // Синхронизация при изменении initialData (например после загрузки заказа или восстановления черновика)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        documentType: initialData.documentType ?? prev.documentType,
        clientName: initialData.clientName ?? prev.clientName,
        orderName: initialData.orderName ?? prev.orderName,
        orderDate: initialData.orderDate ?? prev.orderDate,
        launchDate: initialData.launchDate ?? prev.launchDate,
        deadline: initialData.deadline ?? prev.deadline,
        lineNumber: initialData.lineNumber ?? prev.lineNumber,
        manager: initialData.manager ?? prev.manager,
      }));
    }
  }, [initialData]);

  const handleChange = (field: keyof OrderFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleClientChange = (value: string) => {
    if (value === 'CREATE_NEW_CLIENT') {
      navigate('/users');
      return;
    }
    handleChange('clientName', value);
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
            select
            fullWidth
            size="small"
            label="Клиент"
            placeholder="Выберите клиента"
            value={formData.clientName}
            onChange={(e) => handleClientChange(e.target.value)}
          >
            {isLoadingUsers && <MenuItem disabled>Загрузка...</MenuItem>}
            {!isLoadingUsers && clients.length === 0 && (
              <MenuItem disabled>Нет клиентов</MenuItem>
            )}
            {clients.map(client => (
              <MenuItem key={client.id} value={client.fullName}>
                {client.fullName}
              </MenuItem>
            ))}
            <MenuItem value="CREATE_NEW_CLIENT" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              + Добавить клиента
            </MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Заказ"
            placeholder="Название заказа"
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
            select
            fullWidth
            size="small"
            label="Срок"
            placeholder="Выберите срок"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
          >
            {deadlineOptions.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Строка
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formData.lineNumber || '—'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </GlassCard>
  );
};
