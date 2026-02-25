/**
 * @file Хуки для управления производственными операциями
 * @description Содержит SWR хуки для работы с API операций
 */

import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type { Operation, CreateOperationDto, UpdateOperationDto } from './types';

const OPERATIONS_API_URL = '/operations';

/**
 * Хук для получения списка всех операций
 */
export const useOperations = () => {
    const { data, error, isLoading } = useSWR<Operation[]>(
        OPERATIONS_API_URL,
        async (url: string) => {
            const response = await apiClient.get(url);
            return response.data;
        }
    );

    return {
        operations: data || [],
        isLoading,
        isError: !!error,
        error,
    };
};

/**
 * Хук для получения только активных операций
 */
export const useActiveOperations = () => {
    const { data, error, isLoading } = useSWR<Operation[]>(
        `${OPERATIONS_API_URL}/active`,
        async (url: string) => {
            const response = await apiClient.get(url);
            return response.data;
        }
    );

    return {
        operations: data || [],
        isLoading,
        isError: !!error,
        error,
    };
};

/**
 * Хук для получения одной операции по ID
 */
export const useOperation = (id?: number) => {
    const { data, error, isLoading } = useSWR<Operation>(
        id ? `${OPERATIONS_API_URL}/${id}` : null,
        async (url: string) => {
            const response = await apiClient.get(url);
            return response.data;
        }
    );

    return {
        operation: data,
        isLoading,
        isError: !!error,
        error,
    };
};

/**
 * Хук для создания новой операции
 */
export const useCreateOperation = () => {
    return {
        createOperation: async (dto: CreateOperationDto): Promise<Operation> => {
            const response = await apiClient.post<Operation>(OPERATIONS_API_URL, dto);
            await mutate(OPERATIONS_API_URL);
            return response.data;
        }
    };
};

/**
 * Хук для обновления операции
 */
export const useUpdateOperation = () => {
    return {
        updateOperation: async (id: number, dto: UpdateOperationDto): Promise<Operation> => {
            const response = await apiClient.put<Operation>(`${OPERATIONS_API_URL}/${id}`, dto);
            await mutate(OPERATIONS_API_URL);
            await mutate(`${OPERATIONS_API_URL}/${id}`);
            return response.data;
        }
    };
};

/**
 * Хук для удаления операции
 */
export const useDeleteOperation = () => {
    return {
        deleteOperation: async (id: number): Promise<void> => {
            await apiClient.delete(`${OPERATIONS_API_URL}/${id}`);
            await mutate(OPERATIONS_API_URL);
        }
    };
};
