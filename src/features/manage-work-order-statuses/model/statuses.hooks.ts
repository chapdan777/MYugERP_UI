/**
 * @file Хуки для управления статусами заказ-нарядов
 */

import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type { WorkOrderStatus, CreateWorkOrderStatusDto, UpdateWorkOrderStatusDto } from './types';

const API_URL = '/work-order-statuses';

/**
 * Хук для получения всех статусов
 */
export const useWorkOrderStatuses = () => {
    const { data, error, isLoading } = useSWR<WorkOrderStatus[]>(
        API_URL,
        async (url: string) => {
            const response = await apiClient.get(url);
            return response.data;
        }
    );

    return {
        statuses: data || [],
        isLoading,
        isError: !!error,
        error,
    };
};

/**
 * Хук для создания статуса
 */
export const useCreateWorkOrderStatus = () => {
    return {
        createStatus: async (dto: CreateWorkOrderStatusDto): Promise<WorkOrderStatus> => {
            const response = await apiClient.post<WorkOrderStatus>(API_URL, dto);
            await mutate(API_URL);
            return response.data;
        }
    };
};

/**
 * Хук для обновления статуса
 */
export const useUpdateWorkOrderStatus = () => {
    return {
        updateStatus: async (id: number, dto: UpdateWorkOrderStatusDto): Promise<WorkOrderStatus> => {
            const response = await apiClient.put<WorkOrderStatus>(`${API_URL}/${id}`, dto);
            await mutate(API_URL);
            return response.data;
        }
    };
};

/**
 * Хук для удаления статуса
 */
export const useDeleteWorkOrderStatus = () => {
    return {
        deleteStatus: async (id: number): Promise<void> => {
            await apiClient.delete(`${API_URL}/${id}`);
            await mutate(API_URL);
        }
    };
};
