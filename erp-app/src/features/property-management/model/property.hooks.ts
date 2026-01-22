/**
 * @file Хуки для управления свойствами
 * @description Содержит SWR хуки для получения и управления дополнительными свойствами
 */

import useSWR from 'swr';
import { apiClient } from '../../../shared/api/client';

// Базовый URL для свойств
const PROPERTIES_API_URL = '/properties';

/**
 * Хук для получения списка свойств
 */
export const useProperties = () => {
  console.log('🔍 useProperties hook called');
  
  // Временное решение: тестовые свойства в localStorage
  const testProperties = [
    {
      id: 'prop-1',
      name: 'Материал филенки',
      type: 'select',
      description: 'Материал для филенок',
      defaultValue: 'Массив',
      possibleValues: ['Массив', 'МДФ', 'Пластик'],
      dataType: 'select'
    },
    {
      id: 'prop-2',
      name: 'Филенка',
      type: 'select',
      description: 'Тип филенки',
      defaultValue: 'Гладкая',
      possibleValues: ['Гладкая', 'Рельефная', 'Фрезерованная'],
      dataType: 'select'
    },
    {
      id: 'prop-3',
      name: 'Высота',
      type: 'text',
      description: 'Высота изделия в мм',
      defaultValue: '',
      dataType: 'text'
    },
    {
      id: 'prop-4',
      name: 'Активно',
      type: 'boolean',
      description: 'Активность свойства',
      defaultValue: 'true',
      dataType: 'boolean'
    }
  ];
  
  // Сохраняем тестовые свойства в localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('test-properties');
    if (!saved) {
      localStorage.setItem('test-properties', JSON.stringify(testProperties));
    }
  }
  
  const { data, error, isLoading, mutate } = useSWR<any[]>(
    PROPERTIES_API_URL,
    async (url: string) => {
      console.log('📡 Fetching properties from:', url);
      try {
        const response = await apiClient.get(url);
        console.log('✅ Properties fetched:', response.data);
        
        // Если API вернул пустой массив, используем тестовые данные
        if (!response.data || response.data.length === 0) {
          console.log('⚠️ API returned empty array, using test properties');
          return testProperties;
        }
        
        // Добавляем possibleValues для select типов, если их нет
        const propertiesWithDefaults = response.data.map((prop: any) => {
          if ((prop.type === 'select' || prop.dataType === 'select') && (!prop.possibleValues || prop.possibleValues.length === 0)) {
            // Определяем возможные значения по имени свойства только если их нет
            if (prop.name.includes('Материал') || prop.description?.includes('Материал')) {
              return {
                ...prop,
                possibleValues: ['Массив', 'МДФ', 'Пластик', 'ДСП', 'ДВП'],
                defaultValue: prop.defaultValue || 'Массив',
                dataType: 'select'
              };
            } else if (prop.name.includes('Филенка') || prop.description?.includes('филен')) {
              return {
                ...prop,
                possibleValues: ['Гладкая', 'Рельефная', 'Фрезерованная', 'Ламинированная'],
                defaultValue: prop.defaultValue || 'Гладкая',
                dataType: 'select'
              };
            } else {
              // По умолчанию для других select свойств
              return {
                ...prop,
                possibleValues: ['Значение 1', 'Значение 2', 'Значение 3'],
                defaultValue: prop.defaultValue || 'Значение 1',
                dataType: 'select'
              };
            }
          }
          return prop;
        });
        
        return propertiesWithDefaults;
      } catch (err) {
        console.warn('⚠️ API error, using test properties:', err);
        // Возвращаем тестовые свойства при ошибке API
        return testProperties;
      }
    }
  );

  console.log('📊 useProperties result:', { data, isLoading, error });
  
  // Используем данные из API или тестовые свойства
  const properties = data || testProperties;
  
  return {
    properties,
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
    createProperty: async (propertyData: any) => {
      try {
        const response = await apiClient.post(PROPERTIES_API_URL, propertyData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании свойства:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для обновления свойства
 */
export const useUpdateProperty = () => {
  return {
    updateProperty: async (id: number, propertyData: any) => {
      try {
        const response = await apiClient.put(`${PROPERTIES_API_URL}/${id}`, propertyData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при обновлении свойства:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для активации свойства
 */
export const useActivateProperty = () => {
  return {
    activateProperty: async (id: number) => {
      try {
        const response = await apiClient.post(`${PROPERTIES_API_URL}/${id}/activate`);
        return response.data;
      } catch (error) {
        console.error('Ошибка при активации свойства:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для деактивации свойства
 */
export const useDeactivateProperty = () => {
  return {
    deactivateProperty: async (id: number) => {
      try {
        const response = await apiClient.post(`${PROPERTIES_API_URL}/${id}/deactivate`);
        return response.data;
      } catch (error) {
        console.error('Ошибка при деактивации свойства:', error);
        throw error;
      }
    },
  };
};