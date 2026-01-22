/**
 * @file Хуки для работы с API шапок свойств
 * @description Custom hooks для взаимодействия с REST API property-headers
 */

import type { 
  PropertyHeader, 
  CreatePropertyHeaderInput, 
  UpdatePropertyHeaderInput,
  PropertyHeaderItem,
  AddItemToHeaderInput
} from './types';
import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';

// Базовый URL для шапок свойств
const PROPERTY_HEADERS_API_URL = '/property-headers';

/**
 * Получение списка всех шапок свойств
 */
export const useGetPropertyHeaders = (filters?: {
  isActive?: boolean;
  orderTypeId?: number;
}) => {
  const { data, error, isLoading } = useSWR<PropertyHeader[]>(
    PROPERTY_HEADERS_API_URL,
    async (url: string) => {
      try {
        const params = new URLSearchParams();
        if (filters?.isActive !== undefined) {
          params.append('isActive', filters.isActive.toString());
        }
        if (filters?.orderTypeId !== undefined) {
          params.append('orderTypeId', filters.orderTypeId.toString());
        }
        
        const fullUrl = params.toString() ? `${url}?${params}` : url;
        const response = await apiClient.get(fullUrl);
        return response.data;
      } catch (err) {
        console.error('Error fetching property headers:', err);
        throw err;
      }
    }
  );

  return {
    propertyHeaders: data || [],
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * Получение шапки свойств по ID
 */
export const useGetPropertyHeaderById = (id: number) => {
  const { data, error, isLoading } = useSWR<PropertyHeader>(
    id ? `${PROPERTY_HEADERS_API_URL}/${id}` : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    propertyHeader: data,
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * Создание новой шапки свойств
 */
export const useCreatePropertyHeader = () => {
  return {
    createPropertyHeader: async (data: CreatePropertyHeaderInput) => {
      try {
        const response = await apiClient.post<PropertyHeader>(PROPERTY_HEADERS_API_URL, data);
        // Обновляем кэш SWR
        await mutate(PROPERTY_HEADERS_API_URL);
        return response.data;
      } catch (error: any) {
        console.error('Ошибка при создании шапки свойств:', error);
        throw error;
      }
    },
  };
};

/**
 * Обновление шапки свойств
 */
export const useUpdatePropertyHeader = () => {
  return {
    updatePropertyHeader: async (id: number, data: UpdatePropertyHeaderInput) => {
      try {
        const response = await apiClient.put<PropertyHeader>(`${PROPERTY_HEADERS_API_URL}/${id}`, data);
        // Обновляем кэш SWR
        await mutate(`${PROPERTY_HEADERS_API_URL}/${id}`);
        await mutate(PROPERTY_HEADERS_API_URL);
        return response.data;
      } catch (error) {
        console.error('Ошибка при обновлении шапки свойств:', error);
        throw error;
      }
    },
  };
};

/**
 * Активация шапки свойств
 */
export const useActivatePropertyHeader = () => {
  return {
    activatePropertyHeader: async (id: number) => {
      try {
        const response = await apiClient.post(`${PROPERTY_HEADERS_API_URL}/${id}/activate`);
        // Обновляем кэш SWR
        await mutate(`${PROPERTY_HEADERS_API_URL}/${id}`);
        await mutate(PROPERTY_HEADERS_API_URL);
        return response.data;
      } catch (error) {
        console.error('Ошибка при активации шапки свойств:', error);
        throw error;
      }
    },
  };
};

/**
 * Деактивация шапки свойств
 */
export const useDeactivatePropertyHeader = () => {
  return {
    deactivatePropertyHeader: async (id: number) => {
      try {
        const response = await apiClient.post(`${PROPERTY_HEADERS_API_URL}/${id}/deactivate`);
        // Обновляем кэш SWR
        await mutate(`${PROPERTY_HEADERS_API_URL}/${id}`);
        await mutate(PROPERTY_HEADERS_API_URL);
        return response.data;
      } catch (error) {
        console.error('Ошибка при деактивации шапки свойств:', error);
        throw error;
      }
    },
  };
};

/**
 * Удаление шапки свойств
 */
export const useDeletePropertyHeader = () => {
  return {
    deletePropertyHeader: async (id: number) => {
      try {
        await apiClient.delete(`${PROPERTY_HEADERS_API_URL}/${id}`);
        // Обновляем кэш SWR
        await mutate(PROPERTY_HEADERS_API_URL);
      } catch (error) {
        console.error('Ошибка при удалении шапки свойств:', error);
        throw error;
      }
    },
  };
};

/**
 * Получение элементов шапки
 */
export const useGetHeaderItems = (headerId: number) => {
  const { data, error, isLoading } = useSWR<PropertyHeaderItem[]>(
    headerId ? `${PROPERTY_HEADERS_API_URL}/${headerId}/items` : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    headerItems: data || [],
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * Добавление элемента в шапку
 */
export const useAddItemToHeader = () => {
  return {
    addItemToHeader: async (headerId: number, data: AddItemToHeaderInput) => {
      try {
        const response = await apiClient.post<PropertyHeaderItem>(
          `${PROPERTY_HEADERS_API_URL}/${headerId}/items`, 
          data
        );
        // Обновляем кэш SWR
        await mutate(`${PROPERTY_HEADERS_API_URL}/${headerId}/items`);
        return response.data;
      } catch (error) {
        console.error('Ошибка при добавлении элемента в шапку:', error);
        throw error;
      }
    },
  };
};