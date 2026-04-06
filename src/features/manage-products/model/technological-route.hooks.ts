import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type { TechnologicalRoute, CreateTechnologicalRouteInput } from './types';

/** Базовый URL API технологических маршрутов */
const TECH_ROUTES_API_URL = '/production/technological-routes';

/**
 * Хук для работы с индивидуальным технологическим маршрутом продукта
 * @param productId - ID продукта (null для пропуска запроса)
 */
export const useTechnologicalRoute = (productId: number | null) => {
    const { data, error, isLoading } = useSWR<TechnologicalRoute>(
        productId ? `${TECH_ROUTES_API_URL}/product/${productId}` : null,
        async (url: string) => {
            try {
                const response = await apiClient.get(url);
                return response.data;
            } catch (e: any) {
                // Возвращаем null при 404 (маршрут не найден)
                if (e.response && e.response.status === 404) {
                    return null;
                }
                throw e;
            }
        }
    );

    /** Создание нового маршрута */
    const saveRoute = async (input: CreateTechnologicalRouteInput) => {
        const response = await apiClient.post(TECH_ROUTES_API_URL, input);
        if (input.productId) {
            await mutate(`${TECH_ROUTES_API_URL}/product/${input.productId}`);
        }
        return response.data;
    };

    /** Обновление существующего маршрута (PATCH) */
    const updateRoute = async (routeId: number, input: Partial<CreateTechnologicalRouteInput>) => {
        const response = await apiClient.patch(`${TECH_ROUTES_API_URL}/${routeId}`, input);
        if (productId) {
            await mutate(`${TECH_ROUTES_API_URL}/product/${productId}`);
        }
        return response.data;
    };

    /** Удаление маршрута */
    const deleteRoute = async (routeId: number) => {
        await apiClient.delete(`${TECH_ROUTES_API_URL}/${routeId}`);
        if (productId) {
            await mutate(`${TECH_ROUTES_API_URL}/product/${productId}`);
        }
    };

    return {
        technologicalRoute: data,
        isLoading,
        isError: error,
        saveRoute,
        updateRoute,
        deleteRoute,
    };
};
