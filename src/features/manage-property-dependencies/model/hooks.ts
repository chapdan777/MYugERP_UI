import useSWR from 'swr';
import { propertyDependenciesApi } from '../api';
import type { CreatePropertyDependencyDto, UpdatePropertyDependencyDto } from './types';

const KEY = 'property-dependencies';

/**
 * Хук для получения зависимостей свойства
 */
export const usePropertyDependencies = (propertyId: number | null) => {
    const { data, error, isLoading, mutate } = useSWR(
        propertyId ? `${KEY}/${propertyId}` : null,
        () => propertyDependenciesApi.getDependenciesByPropertyId(propertyId!)
    );

    return {
        dependencies: data,
        isLoading,
        isError: !!error,
        mutate,
    };
};

/**
 * Хук для управления зависимостями
 */
export const usePropertyDependencyMutations = () => {
    return {
        createDependency: async (dto: CreatePropertyDependencyDto) => {
            return await propertyDependenciesApi.createDependency(dto);
        },
        updateDependency: async (id: number, dto: UpdatePropertyDependencyDto) => {
            return await propertyDependenciesApi.updateDependency(id, dto);
        },
        deleteDependency: async (id: number) => {
            return await propertyDependenciesApi.deleteDependency(id);
        },
    };
};
