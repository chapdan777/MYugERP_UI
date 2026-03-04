import { apiClient } from '../../../shared/api/client';
import type { CreatePropertyDependencyDto, PropertyDependency, UpdatePropertyDependencyDto } from '../model/types';

const BASE_URL = '/property-dependencies';

export const propertyDependenciesApi = {
    /**
     * Получить зависимости для конкретного свойства
     */
    getDependenciesByPropertyId: async (propertyId: number): Promise<{
        asSource: PropertyDependency[];
        asTarget: PropertyDependency[];
    }> => {
        const response = await apiClient.get<{
            asSource: PropertyDependency[];
            asTarget: PropertyDependency[];
        }>(`${BASE_URL}/property/${propertyId}`);
        return response.data;
    },

    /**
     * Создать новую зависимость
     */
    createDependency: async (dto: CreatePropertyDependencyDto): Promise<PropertyDependency> => {
        const response = await apiClient.post<PropertyDependency>(BASE_URL, dto);
        return response.data;
    },

    /**
     * Обновить зависимость
     */
    updateDependency: async (id: number, dto: UpdatePropertyDependencyDto): Promise<PropertyDependency> => {
        const response = await apiClient.put<PropertyDependency>(`${BASE_URL}/${id}`, dto);
        return response.data;
    },

    /**
     * Удалить зависимость
     */
    deleteDependency: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};
