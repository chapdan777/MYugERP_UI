import { apiClient } from '../client';
import type { CalculatePriceDto, PriceCalculationResult } from './types';

export const pricingApi = {
    calculatePrice: async (dto: CalculatePriceDto): Promise<PriceCalculationResult> => {
        const { data } = await apiClient.post<PriceCalculationResult>('/pricing/calculate', dto);
        return data;
    }
};
