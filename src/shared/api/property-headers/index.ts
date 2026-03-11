import { apiClient } from '../client';
import type { PropertyHeader, PropertyHeaderItem, HeaderProduct, GetHeadersParams } from './types';

export const propertyHeadersApi = {
    getAll: async (params?: GetHeadersParams) => {
        const response = await apiClient.get<PropertyHeader[]>('/property-headers', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<PropertyHeader>(`/property-headers/${id}`);
        return response.data;
    },

    getItems: async (id: number) => {
        const response = await apiClient.get<PropertyHeaderItem[]>(`/property-headers/${id}/items`);
        return response.data;
    },

    getProducts: async (id: number, params?: { includeInactive?: boolean }) => {
        const response = await apiClient.get<HeaderProduct[]>(`/property-headers/${id}/products`, { params });
        return response.data;
    },
};
