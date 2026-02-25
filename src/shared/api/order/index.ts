import { apiClient } from '../client';
import type { CreateOrderDto } from './types';

export const orderApi = {
    createOrder: async (data: CreateOrderDto) => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },

    updateOrder: async (id: number | string, data: CreateOrderDto) => {
        const response = await apiClient.put(`/orders/${id}`, data);
        return response.data;
    },

    getOrders: async () => {
        const response = await apiClient.get('/orders');
        return response.data;
    },

    getOrder: async (id: number | string) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    deleteOrder: async (id: number | string) => {
        const response = await apiClient.delete(`/orders/${id}`);
        return response.data;
    },
};
