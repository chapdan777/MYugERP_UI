/**
 * @file Форма управления пользователем
 * @description Компонент формы для создания и редактирования пользователя
 */

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import type { User, UserRole, CreateUserInput, UpdateUserInput } from '../model/types';
import { useCreateUser, useUpdateUser } from '../model/user.hooks';

interface UserFormProps {
  user?: User; // Если передан, то форма для редактирования
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const { createUser } = useCreateUser();
  const { updateUser } = useUpdateUser();
  
  const isEditing = !!user;
  
  // Разделяем типы для состояния формы
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    role: user?.role || 'client',
    isActive: user?.isActive || true,
    password: '', // пароль только при создании
    metadata: user?.metadata || {},
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Функция валидации формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Валидация ФИО
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'ФИО обязательно для заполнения';
    }
    
    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else {
      // Проверка формата email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Невалидный формат email';
      }
    }
    
    // Валидация пароля (только при создании)
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Пароль обязателен для заполнения';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Пароль должен содержать минимум 6 символов';
      }
    }
    
    // Валидация роли
    if (!formData.role) {
      newErrors.role = 'Роль обязательна для выбора';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Выполняем валидацию перед отправкой
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditing && user) {
        // Обновляем пользователя
        const updateData: UpdateUserInput = {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role as UserRole,
          isActive: formData.isActive,
          metadata: formData.metadata,
        };
        
        await updateUser(user.id, updateData);
      } else {
        // Создаем нового пользователя
        // Генерируем username из email (до символа @)
        const username = formData.email.split('@')[0];
        
        const createData: CreateUserInput = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role as UserRole,
          metadata: {
            ...formData.metadata,
            username: username, // Добавляем username в metadata для передачи на бэкенд
          },
        };
        
        console.log('DEBUG UserForm: Generated username:', username);
        console.log('DEBUG UserForm: createData being sent:', JSON.stringify(createData, null, 2));
        
        await createUser(createData);
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error(isEditing ? 'Ошибка обновления пользователя:' : 'Ошибка создания пользователя:', error);
      
      // Обработка ошибок валидации от сервера
      if (error.response?.data?.message) {
        const serverErrors = error.response.data.message;
        
        if (Array.isArray(serverErrors)) {
          // Обработка массива ошибок валидации
          const newErrors: Record<string, string> = {};
          serverErrors.forEach(msg => {
            if (msg.includes('email')) {
              newErrors.email = msg;
            } else if (msg.includes('пароль') || msg.includes('password')) {
              newErrors.password = msg;
            } else if (msg.includes('роль') || msg.includes('role')) {
              newErrors.role = msg;
            } else if (msg.includes('ФИО') || msg.includes('fullName')) {
              newErrors.fullName = msg;
            } else {
              newErrors.submit = msg;
            }
          });
          setErrors(newErrors);
        } else {
          setErrors({ submit: serverErrors });
        }
      } else {
        setErrors({ submit: isEditing ? 'Ошибка при обновлении пользователя' : 'Ошибка при создании пользователя' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isEditing ? 'Редактировать пользователя' : 'Создать нового пользователя'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="ФИО"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={!!errors.fullName}
              helperText={errors.fullName}
              required
              fullWidth
            />
            
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
              fullWidth
            />
            
            {!isEditing && (
              <TextField
                label="Пароль"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                required
                fullWidth
              />
            )}
            
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select
                value={formData.role}
                label="Роль"
                onChange={(e) => handleChange('role', e.target.value as UserRole)}
                error={!!errors.role}
              >
                <MenuItem value="admin">Администратор</MenuItem>
                <MenuItem value="manager">Менеджер</MenuItem>
                <MenuItem value="worker">Работник</MenuItem>
                <MenuItem value="client">Клиент</MenuItem>
              </Select>
              {errors.role && <FormHelperText error>{errors.role}</FormHelperText>}
            </FormControl>
            
            {isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                }
                label="Активен"
              />
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? 'Загрузка...' : (isEditing ? 'Сохранить' : 'Создать')}
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={onCancel}
                disabled={loading}
              >
                Отмена
              </Button>
            </Box>
            
            {errors.submit && (
              <FormHelperText error>{errors.submit}</FormHelperText>
            )}
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;