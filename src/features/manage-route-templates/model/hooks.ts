/**
 * @file Хуки для работы с API шаблонов маршрутов
 */
import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type { RouteTemplate, CreateRouteTemplateInput } from './types';

/** Базовый URL API маршрутов */
const ROUTES_API_URL = '/production/technological-routes';

/**
 * Хук для получения списка шаблонов маршрутов
 */
export const useRouteTemplates = () => {
  const { data, error, isLoading } = useSWR<RouteTemplate[]>(
    `${ROUTES_API_URL}/templates`,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    templates: data || [],
    isLoading,
    isError: error,
  };
};

/**
 * Хук для создания шаблона маршрута
 */
export const useCreateRouteTemplate = () => {
  const createTemplate = async (input: CreateRouteTemplateInput) => {
    const response = await apiClient.post(ROUTES_API_URL, {
      ...input,
      isTemplate: true,
      productId: 0,
    });
    await mutate(`${ROUTES_API_URL}/templates`);
    return response.data;
  };

  return { createTemplate };
};

/**
 * Хук для обновления шаблона маршрута
 */
export const useUpdateRouteTemplate = () => {
  const updateTemplate = async (id: number, input: CreateRouteTemplateInput) => {
    const response = await apiClient.patch(`${ROUTES_API_URL}/${id}`, {
      ...input,
      isTemplate: true,
      productId: 0,
    });
    await mutate(`${ROUTES_API_URL}/templates`);
    return response.data;
  };

  return { updateTemplate };
};

/**
 * Хук для удаления шаблона маршрута
 */
export const useDeleteRouteTemplate = () => {
  const deleteTemplate = async (id: number) => {
    await apiClient.delete(`${ROUTES_API_URL}/${id}`);
    await mutate(`${ROUTES_API_URL}/templates`);
  };

  return { deleteTemplate };
};
