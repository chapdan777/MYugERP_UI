import { apiClient } from '../client';
import type { Property, PropertyDependency, PropertyValue, CreatePropertyValueInput, UpdatePropertyValueInput } from './types';

export const propertyApi = {
    getProperties: async (): Promise<Property[]> => {
        const response = await apiClient.get<Property[]>('/properties/all');
        return response.data;
    },

    getProperty: async (id: number): Promise<Property> => {
        const response = await apiClient.get<Property>(`/properties/${id}`);
        return response.data;
    },

    getDependencies: async (propertyId: number): Promise<{ asSource: PropertyDependency[]; asTarget: PropertyDependency[] }> => {
        const response = await apiClient.get<{ asSource: PropertyDependency[]; asTarget: PropertyDependency[] }>(`/property-dependencies/property/${propertyId}`);
        return response.data;
    },

    // Values
    getPropertyValues: async (propertyId: number): Promise<PropertyValue[]> => {
        const response = await apiClient.get<PropertyValue[]>(`/property-values/by-property/${propertyId}`);
        return response.data;
    },

    createPropertyValue: async (data: CreatePropertyValueInput): Promise<PropertyValue> => {
        const response = await apiClient.post<PropertyValue>('/property-values', data);
        return response.data;
    },

    updatePropertyValue: async (id: number, data: UpdatePropertyValueInput): Promise<PropertyValue> => {
        const response = await apiClient.put<PropertyValue>(`/property-values/${id}`, data);
        return response.data;
    },

    deletePropertyValue: async (id: number): Promise<void> => {
        await apiClient.delete(`/property-values/${id}`);
    }
};
