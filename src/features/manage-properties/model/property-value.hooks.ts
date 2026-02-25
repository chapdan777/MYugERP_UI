/**
 * @file Хуки для управления значениями свойств
 * @description Содержит SWR хуки для получения и управления значениями дополнительных свойств с поддержкой наценки
 */

import useSWR, { mutate } from 'swr';
import { propertyApi } from '../../../shared/api/property';
import type { CreatePropertyValueInput, UpdatePropertyValueInput } from '../../../shared/api/property/types';

/**
 * Хук для получения списка значений свойства
 * @param propertyId ID свойства
 */
export const usePropertyValues = (propertyId: number | undefined) => {
  const key = propertyId ? `/property-values/by-property/${propertyId}` : null;

  const { data, error, isLoading, mutate: mutateValues } = useSWR(key, () =>
    propertyApi.getPropertyValues(propertyId!)
  );

  return {
    propertyValues: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate: mutateValues
  };
};

/**
 * Хук для создания значения свойства
 */
export const useCreatePropertyValue = () => {
  return {
    /**
     * Создает новое значение свойства
     * @param data Данные для создания
     */
    createPropertyValue: async (data: CreatePropertyValueInput) => {
      try {
        const result = await propertyApi.createPropertyValue(data);
        // Обновляем кэш значений этого свойства
        await mutate(`/property-values/by-property/${data.propertyId}`);
        return result;
      } catch (error) {
        console.error('Ошибка при создании значения свойства:', error);
        throw error;
      }
    }
  };
};

/**
 * Хук для обновления значения свойства
 */
export const useUpdatePropertyValue = () => {
  return {
    /**
     * Обновляет существующее значение свойства
     * @param id ID значения
     * @param propertyId ID родительского свойства (для инвалидации кэша)
     * @param data Данные для обновления
     */
    updatePropertyValue: async (id: number, propertyId: number, data: UpdatePropertyValueInput) => {
      try {
        const result = await propertyApi.updatePropertyValue(id, data);
        await mutate(`/property-values/by-property/${propertyId}`);
        return result;
      } catch (error) {
        console.error('Ошибка при обновлении значения свойства:', error);
        throw error;
      }
    }
  };
};

/**
 * Хук для удаления значения свойства
 */
export const useDeletePropertyValue = () => {
  return {
    /**
     * Удаляет значение свойства
     * @param id ID значения
     * @param propertyId ID родительского свойства (для инвалидации кэша)
     */
    deletePropertyValue: async (id: number, propertyId: number) => {
      try {
        await propertyApi.deletePropertyValue(id);
        await mutate(`/property-values/by-property/${propertyId}`);
      } catch (error) {
        console.error('Ошибка при удалении значения свойства:', error);
        throw error;
      }
    }
  };
};