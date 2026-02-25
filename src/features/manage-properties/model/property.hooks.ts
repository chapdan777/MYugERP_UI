/**
 * @file Хуки для управления свойствами
 * @description Содержит SWR хуки для получения и управления дополнительными свойствами
 */

import useSWR from 'swr';
import { apiClient } from '../../../shared/api/client';
import type { Property, CreatePropertyInput, UpdatePropertyInput } from './types';

// Базовый URL для свойств
const PROPERTIES_API_URL = '/properties';

// Хук для получения списка свойств
export const useProperties = () => {
  const { data, error, isLoading, mutate } = useSWR<Property[]>(
    `${PROPERTIES_API_URL}/all`,
    async (url: string) => {
      const response = await apiClient.get<Property[]>(url);
      return response.data;
    }
  );

  return {
    properties: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate
  };
};

/**
 * Хук для создания свойства
 */
export const useCreateProperty = () => {
  return {
    createProperty: async (propertyData: CreatePropertyInput) => {
      const response = await apiClient.post<Property>(PROPERTIES_API_URL, propertyData);
      return response.data;
    },
  };
};

/**
 * Хук для обновления свойства
 */
export const useUpdateProperty = () => {
  return {
    updateProperty: async (id: number, propertyData: UpdatePropertyInput) => {
      // Filter out fields that cannot be updated if necessary, but type ensures correctness
      const response = await apiClient.put<Property>(`${PROPERTIES_API_URL}/${id}`, propertyData);
      return response.data;
    },
  };
};

/**
 * Хук для активации свойства
 */
export const useActivateProperty = () => {
  return {
    activateProperty: async (id: number) => {
      const response = await apiClient.post<Property>(`${PROPERTIES_API_URL}/${id}/activate`);
      return response.data;
    },
  };
};

/**
 * Хук для деактивации свойства
 */
export const useDeactivateProperty = () => {
  return {
    deactivateProperty: async (id: number) => {
      const response = await apiClient.post<Property>(`${PROPERTIES_API_URL}/${id}/deactivate`);
      return response.data;
    },
  };
};