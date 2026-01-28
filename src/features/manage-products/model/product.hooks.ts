/**
 * @file Хуки для управления номенклатурой
 * @description Содержит SWR хуки для получения, создания и обновления продуктов
 */

import type { Product, CreateProductInput, UpdateProductInput } from './types';
import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';

// Базовый URL для продуктов
const PRODUCTS_API_URL = '/products';

/**
 * Хук для получения списка продуктов
 */
export const useProducts = () => {
  const { data, error, isLoading } = useSWR<Product[]>(
    PRODUCTS_API_URL,
    async (url: string) => {
      console.log('Fetching products from:', url);
      try {
        const response = await apiClient.get(url);
        console.log('Products response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
      }
    }
  );

  return {
    products: data || [],
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * Хук для получения продукта по ID
 */
export const useProduct = (productId: string) => {
  const { data, error, isLoading } = useSWR<Product>(
    productId ? `${PRODUCTS_API_URL}/${productId}` : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    product: data,
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * Хук для создания продукта
 */
export const useCreateProduct = () => {
  return {
    createProduct: async (productData: CreateProductInput) => {
      try {
        console.log('Отправляемые данные:', productData);
        const response = await apiClient.post<Product>(PRODUCTS_API_URL, productData);
        console.log('Ответ сервера:', response.data);
        // Обновляем кэш SWR
        await mutate(PRODUCTS_API_URL);
        return response.data;
      } catch (error: any) {
        console.error('Ошибка при создании продукта:', error);
        console.error('Детали ошибки:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    },
  };
};

/**
 * Хук для обновления продукта
 */
export const useUpdateProduct = () => {
  return {
    updateProduct: async (productId: string, productData: UpdateProductInput) => {
      try {
        console.log('📤 Updating product with data:', productData);
        const response = await apiClient.put<Product>(`${PRODUCTS_API_URL}/${productId}`, productData);
        console.log('📥 Update response:', response.data);
        // Обновляем кэш SWR
        await mutate(`${PRODUCTS_API_URL}/${productId}`);
        await mutate(PRODUCTS_API_URL);
        return response.data;
      } catch (error) {
        console.error('Ошибка при обновлении продукта:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для деактивации продукта
 */
export const useDeactivateProduct = () => {
  return {
    deactivateProduct: async (productId: string) => {
      try {
        const response = await apiClient.put(`${PRODUCTS_API_URL}/${productId}/deactivate`);
        // Обновляем кэш SWR
        await mutate(`${PRODUCTS_API_URL}/${productId}`);
        await mutate(PRODUCTS_API_URL);
        return response.data;
      } catch (error) {
        console.error('Ошибка при деактивации продукта:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для удаления продукта
 */
export const useDeleteProduct = () => {
  return {
    deleteProduct: async (productId: string) => {
      try {
        await apiClient.delete(`${PRODUCTS_API_URL}/${productId}`);
        // Обновляем кэш SWR
        await mutate(PRODUCTS_API_URL);
      } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для установки свойств продукта
 */
export const useSetProductProperties = () => {
  return {
    setProductProperties: async (
      productId: number,
      properties: Array<{
        propertyId: number;
        isRequired?: boolean;
        displayOrder?: number;
      }>
    ) => {
      try {
        console.log(`📤 Setting properties for product ${productId}:`, properties);
        await apiClient.put(`${PRODUCTS_API_URL}/${productId}/properties`, {
          properties,
        });
        console.log(`✅ Properties set successfully for product ${productId}`);
        // Обновляем кэш SWR
        await mutate(`${PRODUCTS_API_URL}/${productId}`);
        await mutate(PRODUCTS_API_URL);
      } catch (error) {
        console.error('Ошибка при установке свойств продукта:', error);
        throw error;
      }
    },
  };
};

/**
 * Хук для получения свойств продукта
 */
export const useGetProductProperties = () => {
  const getProductProperties = async (productId: number) => {
    try {
      console.log(`📥 Getting properties for product ${productId}`);
      const response = await apiClient.get(`${PRODUCTS_API_URL}/${productId}/properties`);
      console.log(`📥 Product properties response:`, response.data);
      return response.data.properties || [];
    } catch (error) {
      console.error('Ошибка при получении свойств продукта:', error);
      return [];
    }
  };

  return { getProductProperties };
};