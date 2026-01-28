import { apiClient } from '../client';
import type { CreateOrderDto } from './types';

export const orderApi = {
    createOrder: async (data: CreateOrderDto) => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },
};
