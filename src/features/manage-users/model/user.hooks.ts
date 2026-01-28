/**
 * Хуки для работы с пользователями через SWR
 */
import useSWR, { mutate } from 'swr';
import { apiClient } from '@shared/api';
import type { User, CreateUserInput, UpdateUserInput } from './types';

/** URL для API пользователей (без префикса /api, так как он уже есть в baseURL) */
const USERS_API_URL = '/users';

/**
 * Хук для получения списка пользователей
 */
export const useUsers = () => {
  const { data, error, isLoading } = useSWR<User[]>(
    USERS_API_URL,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    users: data || [],
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * Хук для получения пользователя по ID
 */
export const useUser = (userId: string) => {
  const { data, error, isLoading } = useSWR<User>(
    userId ? `${USERS_API_URL}/${userId}` : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * Хук для создания пользователя
 */
export const useCreateUser = () => {
  return {
    createUser: async (userData: CreateUserInput) => {
      try {
        // Формируем правильную структуру данных для бэкенда
        console.log('DEBUG VERSION 2: Original userData received:', JSON.stringify(userData, null, 2));
        
        const backendData = {
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          // Извлекаем username из metadata или генерируем из email
          username: userData.metadata?.username || userData.email.split('@')[0],
        };
        
        console.log('DEBUG: Transformed backendData being sent:', JSON.stringify(backendData, null, 2));
        console.log('DEBUG: Username value:', backendData.username);
        
        const response = await apiClient.post<User>(USERS_API_URL, backendData);
        // Обновляем кэш SWR
        await mutate(USERS_API_URL);
        return response.data;
      } catch (error: any) {
        console.error('Ошибка при создании пользователя:', error);
        
        // Улучшенная обработка сетевых ошибок
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          throw new Error('Превышено время ожидания ответа от сервера. Проверьте подключение к интернету и попробуйте снова.');
        }
        
        // Обработка ошибок подключения
        if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
          throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд-сервер запущен и доступен.');
        }
        
        // Обработка ошибок валидации от сервера
        if (error.response?.data?.message) {
          const serverMessage = error.response.data.message;
          if (Array.isArray(serverMessage)) {
            throw new Error(serverMessage.join('; '));
          } else {
            throw new Error(serverMessage);
          }
        }
        
        // Обработка стандартных HTTP ошибок
        if (error.response?.status) {
          switch (error.response.status) {
            case 400:
              throw new Error('Неверные данные запроса. Проверьте правильность заполнения формы.');
            case 401:
              throw new Error('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
            case 403:
              throw new Error('Доступ запрещен. У вас недостаточно прав для выполнения этого действия.');
            case 409:
              // Для 409 показываем конкретное сообщение от сервера, если есть
              if (error.response?.data?.message) {
                const serverMessage = error.response.data.message;
                if (typeof serverMessage === 'string') {
                  throw new Error(serverMessage);
                }
              }
              throw new Error('Конфликт данных. Возможно, пользователь с такими данными уже существует.');
            case 500:
              throw new Error('Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.');
            default:
              throw new Error(`Ошибка сервера: ${error.response.status} ${error.response.statusText}`);
          }
        }
        
        // Стандартная ошибка
        throw new Error('Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.');
      }
    },
  };
};

/**
 * Хук для обновления профиля пользователя
 */
export const useUpdateUser = () => {
  return {
    updateUser: async (userId: string, userData: UpdateUserInput) => {
      try {
        // Разделяем обновление профиля и метаданных от изменения роли и статуса
        const profileData = {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.metadata?.phone, // если телефон хранится в metadata
        };
        
        // Убираем undefined значения
        const cleanProfileData = Object.fromEntries(
          Object.entries(profileData).filter(([_, value]) => value !== undefined)
        );
        
        // Обновляем профиль
        if (Object.keys(cleanProfileData).length > 0) {
          await apiClient.put<User>(`${USERS_API_URL}/${userId}`, cleanProfileData);
        }
        
        // Обновляем роль, если она изменилась
        if (userData.role !== undefined) {
          await apiClient.put(`${USERS_API_URL}/${userId}/role`, { role: userData.role });
        }
        
        // Обновляем статус активности
        if (userData.isActive !== undefined) {
          const statusEndpoint = userData.isActive ? 'activate' : 'deactivate';
          await apiClient.put(`${USERS_API_URL}/${userId}/${statusEndpoint}`);
        }
        
        // Обновляем кэш SWR
        await mutate(`${USERS_API_URL}/${userId}`);
        await mutate(USERS_API_URL);
        
        // Получаем обновленного пользователя
        const response = await apiClient.get<User>(`${USERS_API_URL}/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для удаления пользователя
 */
export const useDeleteUser = () => {
  return {
    deleteUser: async (userId: string) => {
      try {
        await apiClient.delete(`${USERS_API_URL}/${userId}`);
        // Обновляем кэш SWR
        await mutate(USERS_API_URL);
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        throw error;
      }
    },
  };
};