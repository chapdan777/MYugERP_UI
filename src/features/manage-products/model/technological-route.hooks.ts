import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type { TechnologicalRoute, CreateTechnologicalRouteInput } from './types';

const TECH_ROUTES_API_URL = '/production/technological-routes';

export const useTechnologicalRoute = (productId: number | null) => {
    // Only fetch if productId is present
    const { data, error, isLoading } = useSWR<TechnologicalRoute>(
        productId ? `${TECH_ROUTES_API_URL}/product/${productId}` : null,
        async (url: string) => {
            try {
                const response = await apiClient.get(url);
                return response.data;
            } catch (e: any) {
                // Return null if not found (404), otherwise throw
                if (e.response && e.response.status === 404) {
                    return null;
                }
                throw e;
            }
        }
    );

    const saveRoute = async (input: CreateTechnologicalRouteInput) => {
        const response = await apiClient.post(TECH_ROUTES_API_URL, input);
        if (input.productId) {
            await mutate(`${TECH_ROUTES_API_URL}/product/${input.productId}`);
        }
        return response.data;
    };

    return {
        technologicalRoute: data,
        isLoading,
        isError: error,
        saveRoute
    };
};
